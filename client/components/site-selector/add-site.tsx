import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { onboardingUrl } from 'calypso/lib/paths';
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

	return (
		<Button
			primary
			href={ `${ onboardingUrl() }?ref=calypso-selector` }
			onClick={ recordAddNewSite }
		>
			{ translate( 'Add new site' ) }
		</Button>
	);
};

export default SiteSelectorAddSite;
