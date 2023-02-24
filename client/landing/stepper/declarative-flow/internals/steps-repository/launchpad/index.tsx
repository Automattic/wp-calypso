import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useLaunchpad } from 'calypso/data/sites/use-launchpad';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useRecordSignupComplete } from 'calypso/landing/stepper/hooks/use-record-signup-complete';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { useQuery } from '../../../../hooks/use-query';
import StepContent from './step-content';
import type { Step } from '../../types';

import './style.scss';

type LaunchpadProps = {
	navigation: NavigationControls;
	flow: string | null;
};

const Launchpad: Step = ( { navigation, flow }: LaunchpadProps ) => {
	const translate = useTranslate();
	const almostReadyToLaunchText = translate( 'Almost ready to launch' );
	const siteSlug = useSiteSlugParam();
	const verifiedParam = useQuery().get( 'verified' );
	const site = useSite();
	const { data } = useLaunchpad( siteSlug || '', false );
	const { launchpad_screen } = data || {};
	const recordSignupComplete = useRecordSignupComplete( flow );
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );

	const fetchingSiteError = useSelect( ( select ) => select( SITE_STORE ).getFetchingSiteError() );

	if ( ! isLoggedIn ) {
		window.location.replace( `/home/${ siteSlug }` );
	}

	if ( ! siteSlug || fetchingSiteError?.error ) {
		window.location.replace( '/home' );
	}

	useEffect( () => {
		if ( verifiedParam ) {
			const message = translate( 'Email confirmed!' );
			dispatch(
				successNotice( message, {
					duration: 10000,
				} )
			);
		}
	}, [ verifiedParam, translate, dispatch ] );

	useEffect( () => {
		// launchpad_screen changes from undefined to either 'off' or 'full'
		// we need to check if it's defined to avoid recording the same action twice
		if ( launchpad_screen !== undefined ) {
			// The screen option returns false for sites that have never set the option
			if ( ( 'videopress' !== flow && launchpad_screen === false ) || launchpad_screen === 'off' ) {
				window.location.replace( `/home/${ siteSlug }` );
				recordTracksEvent( 'calypso_launchpad_redirect_to_home', { flow: flow } );
			} else {
				recordTracksEvent( 'calypso_launchpad_loaded', { flow: flow } );
			}
		}
	}, [ launchpad_screen, siteSlug, flow ] );

	useEffect( () => {
		if ( siteSlug && site && localStorage.getItem( 'launchpad_siteSlug' ) !== siteSlug ) {
			recordSignupComplete();
			localStorage.setItem( 'launchpad_siteSlug', siteSlug );
		}
	}, [ recordSignupComplete, siteSlug, site ] );

	return (
		<>
			<DocumentHead title={ almostReadyToLaunchText } />
			<StepContainer
				stepName="launchpad"
				goNext={ navigation.goNext }
				isWideLayout={ true }
				skipLabelText={ translate( 'Skip to dashboard' ) }
				skipButtonAlign="bottom"
				hideBack={ true }
				stepContent={
					<StepContent
						siteSlug={ siteSlug }
						submit={ navigation.submit }
						goNext={ navigation.goNext }
						goToStep={ navigation.goToStep }
						flow={ flow }
					/>
				}
				formattedHeader={
					<FormattedHeader id="launchpad-header" headerText={ <>{ almostReadyToLaunchText }</> } />
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default Launchpad;
