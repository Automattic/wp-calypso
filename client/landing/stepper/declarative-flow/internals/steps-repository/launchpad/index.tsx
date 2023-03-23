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
import { areLaunchpadTasksCompleted } from './task-helper';
import type { Step } from '../../types';
import type { SiteSelect } from '@automattic/data-stores';

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
	const {
		data: { launchpad_screen: launchpadScreenOption, checklist_statuses, site_intent },
	} = useLaunchpad( siteSlug );
	const isSiteLaunched = site?.launch_status === 'launched' || false;
	const recordSignupComplete = useRecordSignupComplete( flow );
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );

	const fetchingSiteError = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getFetchingSiteError(),
		[]
	);

	if (
		! isLoggedIn ||
		launchpadScreenOption === 'off' ||
		areLaunchpadTasksCompleted( site_intent, checklist_statuses, isSiteLaunched ) ||
		( launchpadScreenOption === false && 'videopress' !== flow )
	) {
		redirectToSiteHome( siteSlug, flow );
	}

	if ( ! siteSlug || fetchingSiteError?.error ) {
		window.location.replace( '/home' );
	}

	function redirectToSiteHome( siteSlug: string | null, flow: string | null ) {
		recordTracksEvent( 'calypso_launchpad_redirect_to_home', { flow: flow } );
		window.location.replace( `/home/${ siteSlug }` );
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
