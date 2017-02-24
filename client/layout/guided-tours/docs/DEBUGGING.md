# Tips on debugging Guided Tours

## My tour is not shown more than once

After a tour is shown, it is recorded in the user guided tours history and it will not be shown again. To determine if that's the case:

* enable the debug info for GT: `localStorage.setItem( 'debug', 'calypso:guided*' )`
* GT does `eligibleTours = reachedTours - seenTours`, so if your tour is in the `seen` array, then you have to reset the history.

In the following example, the tours `gdocsIntegrationTour` and `editorInsertMenu` were already seen by the user, so they won't be shown again.

![Tour seen](./img/tour-seen.png)

Currently, there is no systematic way of clearing an user history for debugging. One way you can clear it is by applying the [`clean-history.patch`](./patch/clean-history.patch) to your working tree, load the page to clean the history, and remove it again.

## My tour is only shown when called via the query arg

If your tour is only shown when it is called via the query arg (`?tour=<TOURNAME>`), there are two places to check:

* the triggers for your tour, meaning the `when` function.
* [are the user preferences missing](https://github.com/Automattic/wp-calypso/pull/10822)? A typical scenario you may run into is that your 2FA token is stale: visit the `/me` section and either disable the 2FA or introduce a valid code.
