import { Button } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { onboardingUrl } from 'calypso/lib/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const SiteSelectorAddSite: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteSlug = useSelector( getSelectedSiteSlug );
	const recordAddNewSite = useCallback( () => {
		const event = isJetpackCloud()
			? 'calypso_add_new_jetpack_click'
			: 'calypso_add_new_wordpress_click';

		dispatch( recordTracksEvent( event ) );
	}, [ dispatch ] );

	return (
		<Button
			primary
			href={ addQueryArgs( onboardingUrl(), {
				ref: 'calypso-selector',
				source: 'my-home',
				siteSlug,
			} ) }
			onClick={ recordAddNewSite }
		>
			{ translate( 'Add new site' ) }
		</Button>
	);
};

export default SiteSelectorAddSite;
