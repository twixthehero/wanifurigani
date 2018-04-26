@echo off
title Build Wani-Furigani

rmdir /s /q build

call :run "if not exist build mkdir build"
if exist build (
    cd build
    call :run "if not exist css mkdir css"
    call :run "if not exist images mkdir images"
    call :run "if not exist js mkdir js"
    cd ..
)
call :run "xcopy /y /e src\* build\"
call :run "copy /y WK-JS-API-Wrapper\wanikani.js build\js\"
call :run "copy /y manifest.json build\"
call :run "copy /y license.md build\"
goto success

:run
%~1
if errorlevel 1 (
    echo %~1...Failed
    goto failed
) else (
    echo %~1...Success
)
exit /b 0

:success
exit 0

:failed
pause
exit 1