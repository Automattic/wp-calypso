# Keyring Connect Button

This component is used to display a connect button for an external service.
Its main goal is to be able to create a new Keyring connections outside the Sharing page.

It does not handle any kind of custom logic a service must have once the keyring connection
is established as it usually happens in Sharing. For instance, for services that works with
publicize, a new publicize connection is automatically created.

Once the keyring connection exists, clicking on this button again will execute the `onConnect`
action immediately.

## Props

### serviceId (string)

The ID of the external service this button will attempt to connect the user to.
The list of available services is given by the `/meta/external-services` API endpoint
but most service IDs are currently visible in the [ServiceExamples](../../my-sites/marketing/connections/service-examples.jsx)
component.

### onClick (Function)

Function to execute on button click (often needed for analytics purposes).

### onConnect (Function)

Function to execute once the keyring connection has been created.
