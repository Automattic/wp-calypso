Registrant Extra Info Forms
===========================

This module provides forms to support TLD-specific requirements.

These forms aim to be extremely thin, returning a component that only does 3
things:

1. Presents just the form elements required for a given TLD
2. Expose a single onChange event that returns the state of it's fields when any of them change
3. Accept errors & warnings through props and display them with the appropriate fields

### Validation

The `WithContactDetailsValidation()` higher order component facilitates
client-side validation of tld-specific requirements for these forms by
validating the user's contact details against the appropriate JSON schema and
passing any validation errors on to the form for display.
