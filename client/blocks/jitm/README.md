# JITM (Just In Time Messages)

JITM's are messages designed to show when the site is in a specific state, similar to
Guides (emails) and Guided Tours. The difference being that JITMs follow a user around
between Calypso and wp-admin. This allows them to be more effective.

They are primarily designed for Jetpack sites at the moment, but that can change in the
future. They're used in all types of scenarios:

- Inform the user about free (premium/business) plans
- Remind them to make a backup before upgrade
- Inform them about theme specific things
- Much, much, more

## Props

### currentSite (number)

The user's current selected site

### data (object)

The jitm information from the API
