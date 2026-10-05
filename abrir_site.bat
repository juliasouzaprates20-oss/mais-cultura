@echo off
title +Cultura • Servidor Local
echo ========================================================
echo    +CULTURA - Plataforma Inteligente de Entretenimento
echo ========================================================
echo.
echo Iniciando servidor em http://localhost:8080/ ...
start http://localhost:8080/
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
