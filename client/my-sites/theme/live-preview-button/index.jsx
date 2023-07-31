import { Button } from '@automattic/components';

/**
 * Live Preview leveraging Gutenberg's Block Theme Previews
 *
 * @see pbxlJb-3Uv-p2
 */
export const LivePreviewButton = ( { isLivePreviewSupported, translate, livePreviewUrl } ) => {
	if ( ! isLivePreviewSupported ) {
		return null;
	}
	return <Button href={ livePreviewUrl }>{ translate( 'Live Preview' ) }</Button>;
};
