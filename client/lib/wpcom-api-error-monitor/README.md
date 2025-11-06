# API Error Tracking

This module provides automatic tracking of API errors in the Calypso application and can trigger protective actions (like logout) when too many errors occur.

## Overview

The WPCOM API error monitor watches responses coming back from `public-api.wordpress.com` and tracks:
- Total errors within a rolling time window
- Error counts grouped by HTTP status

When configured thresholds are exceeded, it automatically logs the current user out.

## How It Works

1. **Integration Point**: The monitor hooks into `wpcom-xhr-wrapper`, the shared client used for all Calypso WPCOM requests.
2. **Error Detection**: Any failed XHR response (network or HTTP error) is inspected before the original callback fires.
3. **Threshold Monitoring**: A rolling window counts how many tracked status codes have occurred (defaults to 10 per minute).
4. **Action Triggering**: Once the threshold is met, the tracker surfaces a notice and logs the user out.

## Files

- `index.ts` - Main monitor implementation and configuration
- `../wpcom-xhr-wrapper/index.js` - Integration point
- `test/wpcom-api-error-monitor.test.js` - Unit tests

## Configuration

The tracker uses sensible defaults (1-minute window, maximum of 10 errors, `401`/`403` status tracking). You can override these defaults when creating the singleton:

```javascript
import { WPCOMApiErrorMonitor } from 'calypso/lib/wpcom-api-error-monitor';

new WPCOMApiErrorMonitor( {
  maxErrors: 5,
  trackedStatusCodes: [ 401, 403, 500 ],
} );
```

## Behavior

When the error threshold is exceeded, the monitor automatically:
1. Displays an error notice to the user
2. Logs the user out and redirects to the login page

This behavior is not customizable - the monitor always performs logout when thresholds are exceeded.

### Ignored Errors

Customize which errors are monitored in `shouldTrackError()`:
- Skip network/offline errors
- Ignore user input validation errors
- Filter by error message or code

## Usage Examples

### Basic Usage (Already Integrated)

The tracker is automatically integrated and will work with default settings.

### Testing Error Scenarios

To test error tracking in development:

1. Set aggressive thresholds in config (e.g. `maxErrors: 3`) if you instantiate your own monitor.
2. Trigger API errors (e.g., send invalid credentials or force a 500).
3. Watch the console for `calypso:wpcom-api-error-monitor` debug output and confirm the logout notice appears.

### Hooking into the monitor

Most callers should simply forward failures to the helper:

```javascript
import { captureErrorForAPIFailureLogoutTrigger } from 'calypso/lib/wpcom-api-error-monitor';

if ( error ) {
  captureErrorForAPIFailureLogoutTrigger( params, error );
}
```

## Monitored Error Types

### Tracked Errors (401, 403, 429, 500-504)
- **401**: Unauthorized - Session expired or invalid authentication
- **403**: Forbidden - API access denied
- **429**: Rate limited - Too many requests
- **500**: Internal server error
- **502**: Bad gateway
- **503**: Service unavailable
- **504**: Gateway timeout

## User Experience

When thresholds are exceeded, users see contextual messages:
- **Multiple errors**: "We are experiencing connection issues. Please log in again to continue."
- **General**: "You have been logged out due to connection issues. Please log in again."

## Debugging

Enable debug logging:
```bash
localStorage.debug = 'calypso:wpcom-api-error-monitor*'
```

This will log:
- Every tracked error
- Threshold checks
- Cleanup operations
- Logout triggers

## Performance Impact

The tracker has minimal performance impact:
- O(1) error tracking
- Periodic cleanup of old errors
- No external API calls
- Lightweight memory footprint

## Future Enhancements

Potential improvements:
- Per-endpoint error tracking
- Error recovery suggestions
- Offline detection integration
- Exponential backoff for retries
- Error reporting to analytics
- User-facing error dashboard

