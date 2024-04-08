import CommandPalette from '@automattic/command-palette';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { navigate } from 'calypso/lib/navigate';
import './style.scss';

export function SiteSwitch( { redirectTo }: { redirectTo: string } ) {
	const { __ } = useI18n();

	const siteSwitchCommand = {
		name: 'siteSwitch',
		label: __( 'Switch site' ),
		siteSelector: true,
		siteSelectorLabel: __( 'Select site to switch to' ),
		callback: ( params ) => params.navigate( params.site.URL + redirectTo ),
	};

	return (
		<main>
			<DocumentHead title={ __( 'Choose site' ) } />
			<CommandPalette
				currentRoute="/switch-site"
				currentSiteId={ null }
				isOpenGlobal={ true }
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
