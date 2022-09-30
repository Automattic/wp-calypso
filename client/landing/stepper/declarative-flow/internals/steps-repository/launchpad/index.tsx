import { StepContainer } from '@automattic/onboarding';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useEmailVerifiedParam } from 'calypso/landing/stepper/hooks/use-email-verified-param';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { successNotice } from 'calypso/state/notices/actions';
import StepContent from './step-content';
import type { Step } from '../../types';
import './style.scss';

type LaunchpadProps = {
	navigation: NavigationControls;
};

const Launchpad: Step = ( { navigation }: LaunchpadProps ) => {
	const translate = useTranslate();
	const almostReadyToLaunchText = translate( 'Almost ready to launch' );
	const siteSlug = useSiteSlugParam();
	const emailVerified = useEmailVerifiedParam();
	const site = useSite();
	const launchpadScreenOption = site?.options?.launchpad_screen;
	const dispatch = useDispatch();

	useEffect( () => {
		if ( emailVerified ) {
			const message = translate( 'Email confirmed!' );
			dispatch(
				successNotice( message, {
					duration: 10000,
				} )
			);
		}
	}, [] );

	useEffect( () => {
		if ( launchpadScreenOption === 'off' ) {
			window.location.replace( `/home/${ siteSlug }/?forceLoadLaunchpadData=true` );
		}
	}, [ launchpadScreenOption, siteSlug ] );

	return (
		<>
			<DocumentHead title={ almostReadyToLaunchText } />
			<StepContainer
				stepName={ 'launchpad' }
				goNext={ navigation.goNext }
				isWideLayout={ true }
				skipLabelText={ translate( 'Go to Admin' ) }
				skipButtonAlign={ 'bottom' }
				hideBack={ true }
				stepContent={
					<StepContent
						siteSlug={ siteSlug }
						submit={ navigation.submit }
						goNext={ navigation.goNext }
						goToStep={ navigation.goToStep }
					/>
				}
				formattedHeader={
					<FormattedHeader
						id={ 'launchpad-header' }
						headerText={ <>{ almostReadyToLaunchText }</> }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default Launchpad;
