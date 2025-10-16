# Flex site Flow

This flow allows users to quickly create new flex sites with a simple site name form.

## Flow Configuration

- **Flow Name**: `flex-site`
- **Uses Sessions**: Yes (`__experimentalUseSessions`)
- **Built-in Authentication**: Yes (`__experimentalUseBuiltinAuth`)
- **Signup Flow**: Yes
- **Requires Login**: All steps require authentication

## Flow Steps

1. **Flex site Creation** (`flex-site-creation`): A simple form where users enter the site name to create a new flex site:

   - **Site Name** (required): Text field with autofocus
   - **Create a site** button: Disabled until a site name is entered
   - **Migration link**: "Already have an existing site? Migrate it to WordPress.com" redirects to `/setup/site-migration-flow`
   - **Back button**: Returns to `/sites` dashboard

   On submission, the site name is stored in ONBOARD_STORE and the flow navigates to the site creation step.

2. **Site Creation** (`SITE_CREATION_STEP`): Sets up the site creation pending action:

   - Stores the site creation function in ONBOARD_STORE as a pending action
   - Uses the site title stored in ONBOARD_STORE from the previous step
   - Shows a "Creating your site" loading indicator
   - Immediately navigates to the processing step (step is removed from history for proper back button behavior)

3. **Processing** (`processing`): Executes the site creation:

   - Runs the pending action set by the site creation step
   - Calls the `/sites/new` endpoint with the stored configuration
   - Backend determines flex site creation based on user attributes
   - After successful creation, redirects to the flex site's wp-admin with `logmein=direct` parameter for automatic login
   - If site creation fails, falls back to redirecting to the sites dashboard at `/sites`

## Backend Integration

The flex site creation is handled on the backend by checking user attributes. The frontend:

- Collects the site name
- Stores the site title in ONBOARD_STORE
- Uses the standard `SITE_CREATION_STEP`
- The backend `/sites/new` endpoint detects eligible users and creates a flex site accordingly

## Future Enhancements

- Add configuration options form (Site Type, Data Center, PHP version, WordPress version, etc.) and pass to backend
- Add checkout step for paid plans (when applicable)
- Add domain selection step (when applicable)
- Add success/launchpad step after site creation instead of direct redirect to wp-admin

## Testing

To test this flow, navigate to:

```
/setup/flex-site
```

### Test Cases

1. **Successful Site Creation**

   - Navigate to `/setup/flex-site`
   - Enter a site name (e.g., "My Test Site")
   - Click "Create a site"
   - Verify the button shows loading state
   - After creation, verify redirect to the new site's wp-admin with automatic login via `logmein=direct`

2. **Validation - Empty Site Name**

   - Navigate to `/setup/flex-site`
   - Leave the site name field empty
   - Verify the "Create a site" button is disabled
   - Enter a site name
   - Verify the button becomes enabled

3. **Validation - Whitespace Only**

   - Navigate to `/setup/flex-site`
   - Enter only spaces in the site name field
   - Verify the "Create a site" button remains disabled
   - Enter actual text
   - Verify the button becomes enabled

4. **Migration Link**

   - Navigate to `/setup/flex-site`
   - Click "Migrate it to WordPress.com" link in the footer
   - Verify redirect to `/setup/site-migration-flow`
   - Verify tracks event `calypso_flex_site_creation_migration_link_click` is fired

5. **Back Button**

   - Navigate to `/setup/flex-site`
   - Click the "Back to sites" button in the top bar
   - Verify redirect to `/sites` dashboard

## Notes

- This flow requires user authentication for all steps
- No checkout or domains are included in this initial version
- After successful site creation, users are automatically logged into their new flex site's wp-admin
- The flow uses experimental session and built-in authentication features
- Back button navigation is handled properly by removing the site creation step from history
