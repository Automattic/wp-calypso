/**
 * Internal dependencies
 */
import EmbedView from './view';
import getSiteEmbeds from 'state/selectors/get-site-embeds';
import { getSelectedSiteId } from 'state/ui/selectors';
import { reduxDispatch, reduxGetState } from 'lib/redux-bridge';
import { requestEmbeds } from 'state/embeds/actions';

const EmbedViewManager = {};

EmbedViewManager.match = content => {
	const siteId = getSelectedSiteId( reduxGetState() );
	if ( ! siteId ) {
		return;
	}

	reduxDispatch( requestEmbeds( siteId ) );

	const embeds = getSiteEmbeds( reduxGetState(), siteId );
	if ( ! embeds ) {
		return;
	}

	const rxLink = /(^|<p>)(https?:\/\/[^\s"]+?)(<\/p>\s*|$)/gi;
	let currentMatch;
	while ( ( currentMatch = rxLink.exec( content ) ) ) {
		const url = currentMatch[ 2 ];

		// Disregard URL if it's not a supported embed pattern for the site
		const isMatchingPattern = embeds.some( pattern => pattern.test( url ) );
		if ( ! isMatchingPattern ) {
			continue;
		}

		return {
			index: currentMatch.index + currentMatch[ 1 ].length,
			content: url,
		};
	}
};

EmbedViewManager.serialize = content => encodeURIComponent( content );

EmbedViewManager.getComponent = () => EmbedView;

EmbedViewManager.edit = ( editor, content ) => editor.execCommand( 'embedDialog', content );

export default EmbedViewManager;
