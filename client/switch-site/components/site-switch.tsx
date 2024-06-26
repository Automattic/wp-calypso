import CommandPalette from '@automattic/command-palette';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { navigate } from 'calypso/lib/navigate';
import './style.scss';
import type { CommandCallBackParams } from '@automattic/command-palette';

export function SiteSwitch( { redirectTo }: { redirectTo: string } ) {
	const { __ } = useI18n();

	const siteSwitchCommand = {
		name: 'siteSwitch',
		label: __( 'Switch site' ),
		siteSelector: true,
		siteSelectorLabel: __( 'Select site to switch to' ),
		callback: ( params: CommandCallBackParams ) => {
			if ( ! params.site ) {
				return;
			}
			if ( redirectTo.startsWith( '/wp-admin' ) ) {
				params.navigate( params.site.URL + redirectTo );
			} else if ( redirectTo.startsWith( '/' ) && redirectTo.includes( ':site' ) ) {
				params.navigate( redirectTo.replaceAll( ':site', params.site.slug ) );
			} else {
				params.navigate( `/home/${ params.site.slug }` );
			}
		},
	};

	return (
		<main>
			<DocumentHead title={ __( 'Choose site' ) } />
			<CommandPalette
				currentRoute="/switch-site"
				currentSiteId={ null }
				isOpenGlobal
				onBack={ () => window.history.back() }
				navigate={ navigate }
				selectedCommand={ siteSwitchCommand }
				shouldCloseOnClickOutside={ false }
				useCommands={ () => [ siteSwitchCommand ] }
				useSites={ useSiteExcerptsSorted }
				userCapabilities={ {} }
			/>
		</main>
	);
}
