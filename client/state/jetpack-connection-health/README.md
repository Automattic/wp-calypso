# Jetpack Connection Health Information

Jetpack site can experience connection problems. The information in this state subtree tracks possible problem with the connection health of a given site.

If site was marked as one that may have connection problems, we will run additional request to validate it and display notice to the user.

## Actions

|                action                 | description                                                 |
|:-------------------------------------:|-------------------------------------------------------------|
| `setJetpackConnectionMaybeUnhealthy`  | returns an `JETPACK_CONNECTION_MAYBE_UNHEALTHY` action type |
|     `setJetpackConnectionHealthy`     | returns an `JETPACK_CONNECTION_HEALTHY` action type         |
