# Automated Transfer Status Information

This endpoint provides information about possibly active and former automated transfer attempts for a given site.
If no transfers have ever been started for a site then this will return an error, but if any transfers _have_ taken place or are ongoing then this will report information about when it started, what its transfer id is (for reference), the current status and progress of the process, and a few other data points.

If you are conducting a transfer then you will want to monitor this endpoint.

## Monitoring a site for transfers

There is only one actual action you will need to perform to monitor the transfer process for a site.

```js
import { requestStatus } form 'state/automated-transfers/actions';

dispatch( requestStatus( siteId ) );
```

When this middleware sees that request it will not only trigger the actual API request to fetch the data but it will also use the information in the response to ensure that Calypso continues to receive status updates.

## Polling the transfer status

Once a status request comes back from the API it may indicate that a transfer is currently active for the given site.
If it's active then we know that we should continue to poll the API endpoint until it's finished.
This middleware will handle that polling and stop it once a transfer completes or fails.
It will handle this polling automatically for as many sites as request the status.

## Related actions

The following list hasn't yet been implemented but is planned to be implemented immediately.

### Uploading a theme

When a theme upload initiates an automated transfer then the theme state and reducers need to know about the status updates.
This middleware simply dispatches the basic theme transfer status updates for now.
