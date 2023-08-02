import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getIsLivePreviewSupported, getLivePreviewUrl } from 'calypso/state/themes/selectors';

/**
 * Live Preview leveraging Gutenberg's Block Theme Previews
 *
 * @see pbxlJb-3Uv-p2
 */
const _LivePreviewButton = ( { isLivePreviewSupported, translate, livePreviewUrl } ) => {
	if ( ! isLivePreviewSupported ) {
		return null;
	}
	return <Button href={ livePreviewUrl }>{ translate( 'Live Preview' ) }</Button>;
};

export const LivePreviewButton = connect( ( state, { themeId, siteId } ) => {
	const isLivePreviewSupported = getIsLivePreviewSupported( state, themeId, siteId );
	const livePreviewUrl = getLivePreviewUrl( state, themeId, siteId );
	return {
		isLivePreviewSupported,
		livePreviewUrl,
	};
} )( localize( _LivePreviewButton ) );
