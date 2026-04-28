<template>
  <Teleport to="body">
    <Transition name="otp-fade">
      <div
        v-if="visible"
        class="otp-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click.self="handleCancel"
      >
        <div class="otp-dialog">
          <section class="otp-body">
            <h2 :id="titleId" class="otp-title">{{ title }}</h2>
            <p class="otp-subtitle">{{ subtitle }}</p>

            <div class="otp-code-list" :style="{ '--otp-code-length': codeLength }" @paste.prevent="handlePaste">
              <input
                v-for="(_, index) in digits"
                :key="index"
                ref="inputRefs"
                v-model="digits[index]"
                class="otp-input"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="1"
                :aria-label="`OTP 第 ${index + 1} 位`"
                :disabled="loading"
                @input="handleInput(index, $event)"
                @keydown="handleKeydown(index, $event)"
                @focus="selectInput(index)"
              />
            </div>

            <p v-if="errorMessage" class="otp-message otp-error">{{ errorMessage }}</p>
            <p v-else class="otp-message">{{ hint }}</p>
          </section>

          <footer class="otp-actions">
            <button class="otp-button otp-button-secondary" type="button" :disabled="loading" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button
              class="otp-button otp-button-primary"
              type="button"
              :disabled="loading || !isComplete"
              @click="handleConfirm"
            >
              {{ loading ? loadingText : confirmText }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  visible?: boolean
  modelValue?: string
  length?: number
  title?: string
  subtitle?: string
  hint?: string
  errorMessage?: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
  loading?: boolean
  autoFocus?: boolean
}>(), {
  visible: false,
  modelValue: '',
  length: 6,
  title: '输入 OTP 验证码',
  subtitle: '请输入 6 位动态验证码以继续连接',
  hint: '验证码将在短时间内失效',
  errorMessage: '',
  confirmText: '确认连接',
  cancelText: '取消',
  loadingText: '验证中...',
  loading: false,
  autoFocus: true
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'update:visible', value: boolean): void
  (event: 'confirm', value: string): void
  (event: 'cancel'): void
}>()

const inputRefs = ref<HTMLInputElement[]>([])
const titleId = `otp-code-title-${Math.random().toString(36).slice(2, 9)}`

const codeLength = computed(() => Math.max(1, props.length))
const digits = ref<string[]>(createDigits(props.modelValue))
const code = computed(() => digits.value.join(''))
const isComplete = computed(() => code.value.length === codeLength.value && digits.value.every(Boolean))

watch(() => props.length, () => {
  digits.value = createDigits(code.value)
  emitValue()
})

watch(() => props.modelValue, (value) => {
  const nextDigits = createDigits(value)
  if (nextDigits.join('') !== code.value) {
    digits.value = nextDigits
  }
})

watch(() => props.visible, async (visible) => {
  if (visible && props.autoFocus) {
    await nextTick()
    focusInput(firstEmptyIndex())
  }
})

function createDigits(value = '') {
  const chars = normalizeCode(value).slice(0, codeLength.value).split('')
  return Array.from({ length: codeLength.value }, (_, index) => chars[index] ?? '')
}

function normalizeCode(value = '') {
  return value.replace(/\D/g, '')
}

function emitValue() {
  emit('update:modelValue', code.value)
}

function focusInput(index: number) {
  inputRefs.value[index]?.focus()
}

function selectInput(index: number) {
  inputRefs.value[index]?.select()
}

function firstEmptyIndex() {
  const index = digits.value.findIndex((digit) => !digit)
  return index === -1 ? codeLength.value - 1 : index
}

function handleInput(index: number, event: Event) {
  const value = normalizeCode((event.target as HTMLInputElement).value).slice(-1)
  digits.value[index] = value
  emitValue()

  if (value && index < codeLength.value - 1) {
    focusInput(index + 1)
  }
}

function handlePaste(event: ClipboardEvent) {
  const pastedCode = normalizeCode(event.clipboardData?.getData('text') ?? '').slice(0, codeLength.value)
  if (!pastedCode) return

  digits.value = createDigits(pastedCode)
  emitValue()
  nextTick(() => focusInput(firstEmptyIndex()))
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    emitValue()
    nextTick(() => focusInput(index - 1))
    return
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    focusInput(index - 1)
  }

  if (event.key === 'ArrowRight' && index < codeLength.value - 1) {
    event.preventDefault()
    focusInput(index + 1)
  }

  if (event.key === 'Enter' && isComplete.value) {
    handleConfirm()
  }

  if (event.key === 'Escape') {
    handleCancel()
  }
}

function handleConfirm() {
  if (!isComplete.value || props.loading) return
  emit('confirm', code.value)
}

function handleCancel() {
  if (props.loading) return
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.otp-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(112, 116, 122, 0.55);
  backdrop-filter: blur(12px);
}

.otp-dialog {
  width: min(100%, 392px);
  overflow: hidden;
  color: #1f2933;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(222, 228, 235, 0.9);
  border-radius: 8px;
  box-shadow: 0 22px 50px rgba(32, 42, 54, 0.22);
}

.otp-body {
  padding: 36px 28px 32px;
  text-align: center;
}

.otp-title {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0;
}

.otp-subtitle {
  margin: 14px 0 24px;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
}

.otp-code-list {
  display: grid;
  grid-template-columns: repeat(var(--otp-code-length), minmax(0, 1fr));
  gap: 12px;
}

.otp-input {
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: 0;
  color: #1f2937;
  background: #fbfcfe;
  border: 1px solid #dbe1e8;
  border-radius: 6px;
  box-shadow: inset 0 1px 2px rgba(16, 24, 40, 0.04);
  font-size: 22px;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  caret-color: #1677ff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.otp-input:focus {
  outline: none;
  background: #ffffff;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.22), inset 0 1px 2px rgba(16, 24, 40, 0.03);
}

.otp-input:disabled {
  color: #9ca3af;
  background: #f3f4f6;
  cursor: not-allowed;
}

.otp-message {
  min-height: 20px;
  margin: 18px 0 0;
  color: #7a8491;
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
}

.otp-error {
  color: #f56c6c;
}

.otp-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 18px;
  background: rgba(252, 253, 255, 0.98);
  border-top: 1px solid #e4e7ed;
}

.otp-button {
  min-width: 88px;
  height: 36px;
  padding: 0 18px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 34px;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, opacity 0.18s ease;
}

.otp-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.otp-button-secondary {
  color: #1f2937;
  background: #ffffff;
  border: 1px solid #d5dce5;
}

.otp-button-secondary:hover:not(:disabled) {
  color: #1677ff;
  border-color: #8cc8ff;
}

.otp-button-primary {
  color: #ffffff;
  background: #2b85e8;
  border: 1px solid #2b85e8;
}

.otp-button-primary:hover:not(:disabled) {
  background: #409eff;
  border-color: #409eff;
}

.otp-fade-enter-active,
.otp-fade-leave-active {
  transition: opacity 0.18s ease;
}

.otp-fade-enter-from,
.otp-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .otp-dialog {
    width: min(100%, 360px);
  }

  .otp-body {
    padding: 30px 20px 26px;
  }

  .otp-code-list {
    gap: 8px;
  }

  .otp-actions {
    padding: 14px 18px 16px;
  }
}
</style>
