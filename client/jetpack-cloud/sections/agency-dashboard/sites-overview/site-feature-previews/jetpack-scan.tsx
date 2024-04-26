import {
	showJetpackIsDisconnected,
	showNotAuthorizedForNonAdmins,
	showUpsellIfNoScan,
	showUnavailableForVaultPressSites,
	scan,
} from 'calypso/my-sites/scan/controller';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';

import 'calypso/my-sites/scan/style.scss';

type Props = {
	siteId: number;
};
type ContextHandler = ( context: object, next: () => void ) => void;

// Hack: to simulate the contexts chain
function processContextsChain( contextsChain: ContextHandler[], context: object ) {
	const next = ( index: number ) => {
		if ( index < contextsChain.length ) {
			contextsChain[ index ]( context, () => next( index + 1 ) );
		}
	};
	next( 0 );
}

export function JetpackScanPreview( { siteId }: Props ) {
	const contextsChain: ContextHandler[] = [
		showNotAuthorizedForNonAdmins,
		showJetpackIsDisconnected,
		showUnavailableForVaultPressSites,
		showUpsellIfNoScan,
		//wrapInSiteOffsetProvider,
		scan,
	];

	const context = {
		primary: null,
		params: {
			site: siteId,
		},
	};

	processContextsChain( contextsChain, context );

	return (
		<>
			<SitePreviewPaneContent>
				{ siteId ? context.primary : <div>Loading Scan page...</div> }
			</SitePreviewPaneContent>
		</>
	);
}
