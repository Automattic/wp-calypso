# Flex Site Flow

This flow allows users to create new flex sites with custom configuration options.

## Flow Steps

1. **Flex Site Creation** (`flex-site-creation`): A form where users can configure a new flex site with the following options:

   - Site Name (required)
   - Site Type (Production, Staging, Development)
   - Data Center (optional)
   - PHP Version (8.3, 8.2, 8.1, 8.0, 7.4)
   - WordPress Version (Latest, 6.5, 6.4, 6.3)

2. **Create Site** (`create-site`): Sets up the site creation pending action:

   - Stores the site creation function in ONBOARD_STORE as a pending action
   - Uses the site title stored in ONBOARD_STORE
   - Shows a "Creating your site" loading indicator
   - Immediately navigates to the processing step

3. **Processing** (`processing`): Executes the site creation:

   - Runs the pending action set by the create-site step
   - Calls the `/sites/new` endpoint with the stored configuration
   - Backend determines flex site creation based on user attributes
   - After successful creation, redirects to the new site or sites dashboard

## Backend Integration

The flex site creation is handled on the backend by checking user attributes. The frontend simply:

- Collects the site name and configuration preferences (for future use)
- Stores the site title in ONBOARD_STORE
- Uses the standard `create-site` step
- The backend `/sites/new` endpoint will detect eligible users and create a flex site accordingly

## Future Enhancements

- Pass flex configuration options (PHP version, WordPress version, etc.) to backend
- Add checkout step for paid plans (when applicable)
- Add domain selection step (when applicable)
- Add success/launchpad step after site creation

## Testing

To test this flow, navigate to:

```
/setup/flex-site
```

### Test Cases

1. **Basic Site Creation**

   - Navigate to `/setup/flex-site`
   - Enter a site name
   - Keep default selections
   - Click "Create a site"
   - Verify the data is submitted correctly

2. **Custom Configuration**

   - Navigate to `/setup/flex-site`
   - Enter a site name
   - Change Site Type to "Staging"
   - Select a different Data Center
   - Change PHP Version to 8.2
   - Change WordPress Version to 6.4
   - Click "Create a site"
   - Verify all selections are submitted correctly

3. **Migration Link**

   - Navigate to `/setup/flex-site`
   - Click "Migrate it to WordPress.com" link
   - Verify redirect to migration flow

4. **Validation**
   - Navigate to `/setup/flex-site`
   - Try to submit without entering a site name
   - Verify the button is disabled
   - Enter a site name
   - Verify the button is enabled

## Notes

- This flow currently requires user authentication
- No checkout or domains are included in this initial version
- Site creation backend integration is pending
