export interface WebSocketCallbacks {
    onMessage?: (data: string) => void;
    onOpen?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (error: Event) => void;
}

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectInterval: number = 3000; // ms

    private onMessage: ((data: string) => void) | null = null;
    private onOpen: ((event: Event) => void) | null = null;
    private onClose: ((event: CloseEvent) => void) | null = null;
    private onError: ((error: Event) => void) | null = null;

    constructor() {}

    connect(url: string): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = (event: Event) => {
                this.reconnectAttempts = 0;

                if (this.onOpen) {
                    this.onOpen(event);
                }
            };

            this.ws.onmessage = (event: MessageEvent) => {
                if (this.onMessage) {
                    this.onMessage(event.data);
                }
            };

            this.ws.onclose = (event: CloseEvent) => {

                if (this.onClose) {
                    this.onClose(event);
                }

                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        this.connect(url);
                    }, this.reconnectInterval);
                }
            };

            this.ws.onerror = (error: Event) => {
                if (this.onError) {
                    this.onError(error);
                }
            };

        } catch (error) {
            if (this.onError) {
                this.onError(error as Event);
            }
        }
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    // 发送消息
    sendMsg(message: string): boolean {
        if (this.isConnected()) {
            this.ws!.send(message);
            return true;
        } else {
            return false;
        }
    }

    setCallbacks(callbacks: WebSocketCallbacks): void {
        if (callbacks.onMessage) this.onMessage = callbacks.onMessage;
        if (callbacks.onOpen) this.onOpen = callbacks.onOpen;
        if (callbacks.onClose) this.onClose = callbacks.onClose;
        if (callbacks.onError) this.onError = callbacks.onError;
    }

    getReconnectAttempts(): number {
        return this.reconnectAttempts;
    }

    getMaxReconnectAttempts(): number {
        return this.maxReconnectAttempts;
    }

    setMaxReconnectAttempts(attempts: number): void {
        this.maxReconnectAttempts = attempts;
    }

    setReconnectInterval(interval: number): void {
        this.reconnectInterval = interval;
    }
}

export default WebSocketClient;