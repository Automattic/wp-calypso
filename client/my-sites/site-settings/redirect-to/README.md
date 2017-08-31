Check and restrict site access rights to the disconnection process.  
==================================================================

This component redirects to ```/settings/general``` for non-Jetpack
and Atomic sites. The redirection happens automatically prior to rendering
the site as checks are placed in lifecycle calls.

#### TODO
- possibly find better naming for the function ```verifySiteIsJetpack```
since we check BOTH whether a given site is a Jetpack site AND whether
it is non-Atomic. In the latter case, we want to restrict access
to the (dis)connection options.
For more context, see discussion at https://github.com/Automattic/wp-calypso/pull/17555

- generalize the redirection url. Currently, we redirect
to ```/settings/general``` by default. It makes sense since this is
where ```Manage Connection``` link lives, which is the start of the Jetpack
Disconnect Flow. For reusability, we might want to consider passing
redirect link as a prop with ```/settings/general``` as a fallback url.
