# WP-admin auto login

This components opens a GET request to wp-admin of a connected site in order to log in to wp-admin.
Because wp-login.php can automatically log in a user using SSO if `jetpack_sso_bypass_login_forward_wpcom` option is enabled, it redirects user automatically
to a a transparent pixel.
We use this component in Automated Transfer.

## Requirements

1. Site needs Jetpack:
   - enabled and working
   - connected to wpcom
   - it cannot be debug nor development mode
2. Jetpack SSO module needs to be enabled
3. Jetpack needs to have SSO login passthru option enabled ( `add_filter( 'jetpack_sso_bypass_login_forward_wpcom', '__return_true' );` )
