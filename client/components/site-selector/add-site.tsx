import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const SiteSelectorAddSite: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const recordAddNewSite = useCallback( () => {
		let event = 'calypso_add_new_jetpack_click';
		if ( ! isJetpackCloud() ) {
			event = isA8CForAgencies() ? 'calypso_add_new_a4a_click' : 'calypso_add_new_wordpress_click';
		}

		dispatch( recordTracksEvent( event ) );
	}, [ dispatch ] );

	let source = 'jetpack-cloud';

	if ( ! isJetpackCloud() ) {
		source = isA8CForAgencies() ? 'a8c-for-agencies' : 'my-home';
	}
	const addNewSiteUrl = useAddNewSiteUrl( {
		ref: 'site-selector',
		source: source,
	} );

	return (
		<Button primary href={ addNewSiteUrl } onClick={ recordAddNewSite }>
			{ translate( 'Add new site' ) }
		</Button>
	);
};

export default SiteSelectorAddSite;
