/* global agentsManagerData */
import './config';
import WritingOnlyAgentsManager from '@automattic/agents-manager/src/writing-only';
import { useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

const LIMITED_PROVIDER_ID = 'jetpack-ai-sidebar-limited';

function WritingOnlyEntry() {
	const [ provider, setProvider ] = useState( null );
	const providerUrl = agentsManagerData?.jetpackAiWritingProviderUrl;

	useEffect( () => {
		let active = true;
		if ( typeof providerUrl !== 'string' || ! providerUrl ) {
			return;
		}

		void import( /* webpackIgnore: true */ providerUrl )
			.then( ( loadedProvider ) => {
				if ( active && loadedProvider.providerId === LIMITED_PROVIDER_ID ) {
					setProvider( loadedProvider );
				}
			} )
			.catch( ( error ) => {
				// Fail closed: this entry must never fall back to the generic provider list.
				if ( process.env.NODE_ENV !== 'production' ) {
					// eslint-disable-next-line no-console
					console.warn( '[Jetpack AI] Could not load the writing-only provider.', error );
				}
			} );

		return () => {
			active = false;
		};
	}, [ providerUrl ] );

	if ( ! provider ) {
		return null;
	}

	return (
		<WritingOnlyAgentsManager
			sectionName={ agentsManagerData?.sectionName || 'gutenberg' }
			currentUser={ agentsManagerData?.currentUser }
			site={ agentsManagerData?.site }
			currentSiteId={ agentsManagerData?.site?.ID }
			provider={ provider }
		/>
	);
}

registerPlugin( 'jetpack-agents-manager', {
	render: WritingOnlyEntry,
} );
