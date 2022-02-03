import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useOnboardingUrl from './use-onboarding-url';

const SiteSelectorAddSite: FunctionComponent = () => {
	const onboardingUrl = useOnboardingUrl();
	const translate = useTranslate();
	const dispatch = useDispatch();

	const recordAddNewSite = useCallback( () => {
		const event = isJetpackCloud()
			? 'calypso_add_new_jetpack_click'
			: 'calypso_add_new_wordpress_click';

		dispatch( recordTracksEvent( event ) );
	}, [ dispatch ] );

	return (
		<span className="site-selector__add-new-site">
			<Button
				borderless
				href={ `${ onboardingUrl }?ref=calypso-selector` }
				onClick={ recordAddNewSite }
			>
				<Gridicon icon="add-outline" /> { translate( 'Add new site' ) }
			</Button>
		</span>
	);
};

export default SiteSelectorAddSite;
