import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { navigate } from 'calypso/lib/navigate';
import { useDispatch, useStore } from 'calypso/state';
import {
	openCommandPalette,
	overrideCommandPaletteCommands,
	selectCommandPaletteCommand,
} from 'calypso/state/command-palette/actions';
import { getSiteUrl } from 'calypso/state/sites/selectors';

export function SiteSwitch( { redirectTo }: { redirectTo: string } ) {
	const { __ } = useI18n();
	const store = useStore();
	const dispatch = useDispatch();

	const customSiteSwitchCommand = {
		name: 'customSiteSwitch',
		label: __( 'Switch site' ),
		siteSelector: true,
		siteSelectorLabel: __( 'Select site to switch to' ),
		callback: ( params ) => {
			const state = store.getState();
			const siteUrl = getSiteUrl( state, params.site.ID );
			navigate( siteUrl + redirectTo );
		},
	};

	useEffect( () => {
		dispatch( overrideCommandPaletteCommands( [ customSiteSwitchCommand ] ) );
		dispatch( selectCommandPaletteCommand( customSiteSwitchCommand ) );
		dispatch( openCommandPalette() );
	}, [] );

	return (
		<main>
			<DocumentHead title={ __( 'Choose site' ) } />
		</main>
	);
}
