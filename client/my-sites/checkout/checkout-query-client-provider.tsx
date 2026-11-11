import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

/**
 * Renders checkout with the `@automattic/api-queries` QueryClient instead of
 * the one Calypso boots with.
 *
 * api-queries mutations invalidate their own package's client, so under
 * Calypso's client their `onSuccess` invalidation would never reach the UI.
 * Anything checkout writes that code outside checkout reads from Calypso's
 * client must be invalidated there by hand (see `getCalypsoQueryClient`).
 */
export default function CheckoutQueryClientProvider( { children }: PropsWithChildren ) {
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}
