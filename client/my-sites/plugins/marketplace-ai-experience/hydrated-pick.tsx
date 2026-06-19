// Pure render unit for one agent pick. The parent runs the hydration
// queries via `useQueries` and filters out invalid picks before rendering,
// so this component only receives a `pick` plus its (loaded or loading)
// plugin payload and hands them to the standard marketplace card with the
// agent's `why` annotation.

import PluginsBrowserListElement from 'calypso/my-sites/plugins/plugins-browser-item';
import { PluginsBrowserElementVariant } from 'calypso/my-sites/plugins/plugins-browser-item/types';
import type { Pick } from './agent-provider';
import type { JSX } from 'react';

interface HydratedPickProps {
	pick: Pick;
	data: unknown;
	isLoading: boolean;
	siteSlug?: string | null;
}

export default function HydratedPick( {
	pick,
	data,
	isLoading,
	siteSlug,
}: HydratedPickProps ): JSX.Element {
	if ( isLoading ) {
		return (
			<PluginsBrowserListElement isPlaceholder variant={ PluginsBrowserElementVariant.Extended } />
		);
	}

	return (
		<PluginsBrowserListElement
			plugin={ data }
			site={ siteSlug ?? undefined }
			variant={ PluginsBrowserElementVariant.Extended }
			why={ pick.why }
		/>
	);
}
