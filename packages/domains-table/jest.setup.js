const { configure } = require( '@testing-library/react' );

// Domain-row assertions wait on an async React Query transition: the link href starts with the
// numeric blog_id and switches to the site slug once the site query resolves. RTL's default 1000ms
// waitFor window occasionally times out on the stale blog_id under a rare CI event-loop stall.
// Measured CI transition latency tops out ~200ms over 500 samples, so 2000ms (2x the flaky default,
// ~10x the measured tail) absorbs the rare stall without over-provisioning.
configure( { asyncUtilTimeout: 2000 } );
