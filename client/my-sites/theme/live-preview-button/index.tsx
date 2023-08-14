import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { livePreview } from 'calypso/state/themes/actions';
import { getIsLivePreviewSupported } from 'calypso/state/themes/selectors';

interface Props {
	themeId: string;
	siteId: number;
}

/**
 * Live Preview leveraging Gutenberg's Block Theme Previews
 *
 * @see pbxlJb-3Uv-p2
 */
export const LivePreviewButton: FC< Props > = ( { themeId, siteId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isLivePreviewSupported = useSelector( ( state ) =>
		getIsLivePreviewSupported( state, themeId, siteId )
	);
	if ( ! isLivePreviewSupported ) {
		return null;
	}

	return (
		<Button onClick={ () => dispatch( livePreview( themeId, siteId ) ) }>
			{ translate( 'Live Preview' ) }
		</Button>
	);
};
