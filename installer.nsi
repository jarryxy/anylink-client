!macro customInstall
  ExecWait '"$INSTDIR\resources\bin\anylink_client_agent.exe" install'
!macroend

!macro customUnInstall
  ExecWait '"$INSTDIR\resources\bin\anylink_client_agent.exe" uninstall'
!macroend
