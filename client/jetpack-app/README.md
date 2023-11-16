# Jetpack App

This module is specifically designed for use within the Jetpack App to handle App-specific flows. These flows are intended to be executed only within the web views of the Jetpack App. Any access outside of this context will result in a redirection to the homepage.

## Routes

### Plans

- **URL**: `jetpack-app/plans`
- **Description**: This route opens a plans page that is specifically configured for the Jetpack App. It reuses the Plans component used in other pages.
- **Configuration**: 
  - The page can be configured through URL parameter `paid_domain_name`.
  - Plan selection can be received by observing page redirections with `plan_id` and `plan_slug` parameters.

Example:
```
# Access the plans page with a specific domain name which was selected prior on the app.
https://www.wordpress.com/jetpack-app/plans?paid_domain_name=example.com
```