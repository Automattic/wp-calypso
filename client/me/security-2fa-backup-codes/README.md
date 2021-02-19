# Security2faBackupCodes

Used by Security2fa, this component manages the display and verification
of backup codes independent of the 2fa activation flow.

Note that because the state transitions and presentation are substantially
different than when the user is setting up 2fa that there is a separate
component, Security2faSetupBackupCodes, that is used to let the user
manage backup codes as part of setting up 2fa.

This component uses Security2faBackupCodesDetail (a header like component),
Security2faBackupCodesStatus (contains the generate button and displays
the current status of backup codes printed/not), and
Security2faBackupCodesPrompt (lets the user validate a printed code).
