import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import type { ReactNode } from 'react';

// Emotion has no default cache outside the browser, and Calypso's server render
// doesn't provide one, so Emotion-based components (e.g. @wordpress/components
// primitives like Card, Text, VStack) throw during SSR and knock the whole route
// back to client rendering. Wrapping them in this provider makes them SSR-safe.
const cache = createCache( { key: 'css' } );

export default function EmotionCacheProvider( { children }: { children: ReactNode } ) {
	return <CacheProvider value={ cache }>{ children }</CacheProvider>;
}
