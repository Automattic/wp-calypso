# Security2faSetupBackupCodes

Used by Security2faSetup, this component manages the display and verification
of backup codes during the 2fa activation flow. Note that because the state
transitions and presentation are substantially different than when 2fa is
already enable that there is a separate component, Security2faBackupCodes,
that is used to let the user manage backup codes when 2fa is already enabled.

This component uses Security2faBackupCodesDetail (a header like component),
Security2faBackupCodesStatus (contains the generate button and displays
the current status of backup codes printed/not), Security2faBackupCodesPrompt
(lets the user validate a printed code) and Security2faBackupCodesList (to
display printable list of new backup codes.)
