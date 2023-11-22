import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const SiteSelectorAddSite: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const recordAddNewSite = useCallback( () => {
		const event = isJetpackCloud()
			? 'calypso_add_new_jetpack_click'
			: 'calypso_add_new_wordpress_click';

		dispatch( recordTracksEvent( event ) );
	}, [ dispatch ] );

	const addNewSiteUrl = useAddNewSiteUrl( {
		ref: 'site-selector',
		source: isJetpackCloud() ? 'jetpack-cloud' : 'my-home',
	} );

	return (
		<Button primary href={ addNewSiteUrl } onClick={ recordAddNewSite }>
			{ translate( 'Add new site' ) }
		</Button>
	);
};

export default SiteSelectorAddSite;
