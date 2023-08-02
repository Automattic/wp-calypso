import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getIsLivePreviewSupported, getLivePreviewUrl } from 'calypso/state/themes/selectors';

/**
 * Live Preview leveraging Gutenberg's Block Theme Previews
 *
 * @see pbxlJb-3Uv-p2
 */
export const LivePreviewButton = ( { themeId, siteId } ) => {
	const translate = useTranslate();
	const isLivePreviewSupported = useSelector( ( state ) =>
		getIsLivePreviewSupported( state, themeId, siteId )
	);
	const livePreviewUrl = useSelector( ( state ) => getLivePreviewUrl( state, themeId, siteId ) );
	if ( ! isLivePreviewSupported ) {
		return null;
	}
	return <Button href={ livePreviewUrl }>{ translate( 'Live Preview' ) }</Button>;
};
