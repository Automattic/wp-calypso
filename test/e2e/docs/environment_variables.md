# Environment Variables

Environment Variables are values that are defined at the system level to serve as configuration for programs.

## CI Configuration

| Name          | Description                                                                                                                                      | Example | Required | Store in file? |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------- | -------------- |
| MAGELLANDEBUG | If this is set, the full mocha output is printed while running Magellan                                                                          | 1       | No       | **NO**         |
| SAUCEDEBUG    | If this is set, on test failure a breakpoint will be set in SauceLabs, enabling you to continue interacting with the browser for troubleshooting | 1       | No       | **NO**         |
