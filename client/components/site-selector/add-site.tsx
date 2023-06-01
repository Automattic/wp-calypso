import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { onboardingUrl } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
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
			href={ addQueryArgs(
				{
					ref: 'calypso-selector',
					source: 'my-home',
					siteSlug,
				},
				onboardingUrl()
			) }
			onClick={ recordAddNewSite }
		>
			{ translate( 'Add new site' ) }
		</Button>
	);
};

export default SiteSelectorAddSite;
