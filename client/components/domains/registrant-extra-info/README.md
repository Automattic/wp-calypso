# Registrant Extra Info Forms

This module provides forms to support TLD-specific requirements.

These forms aim to be extremely thin, returning a component that only does 3
things:

1. Presents just the form elements required for a given TLD
2. Expose a single onChange event that returns the state of it's fields when any of them change
3. Accept errors & warnings through props and display them with the appropriate fields

## Validation

The `WithContactDetailsValidation` higher order component helps validate
tld-specific requirements for these forms by running the appropriate JSON
schema against the user's contact details and passing any errors on to the form
for display.

### Validation Schemas

Validation schemas come from the api endpoint. We keep a copy locally to simplify testing that we generate like this:
`curl https://public-api.wordpress.com/rest/v1/domains/validation-schemas/uk | jq --tab '.uk' > client/components/domains/registrant-extra-info/test/uk-schema.json`
