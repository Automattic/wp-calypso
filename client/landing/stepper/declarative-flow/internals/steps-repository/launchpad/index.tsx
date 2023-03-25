import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { NEWSLETTER_FLOW } from 'calypso/../packages/onboarding/src';
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
import { requestSettings as membershipsRequestSettings } from 'calypso/state/memberships/settings/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { useQuery } from '../../../../hooks/use-query';
import StepContent from './step-content';
import { areLaunchpadTasksCompleted } from './task-helper';
import { launchpadFlowTasks } from './tasks';
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
	const { saveSiteSettings } = useWPDispatch( SITE_STORE );
	const isLoggedIn = useSelector( isUserLoggedIn );

	const fetchingSiteError = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getFetchingSiteError(),
		[]
	);

	if (
		! isLoggedIn ||
		launchpadScreenOption === 'off' ||
		( launchpadScreenOption === false && 'videopress' !== flow )
	) {
		redirectToSiteHome( siteSlug, flow );
	}

	if (
		areLaunchpadTasksCompleted(
			site_intent,
			launchpadFlowTasks,
			checklist_statuses,
			isSiteLaunched
		)
	) {
		saveSiteSettings( site?.ID, { launchpad_screen: 'off' } );
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

	// If the user is in the newsletter flow, we need to fetch the memberships
	// settings for the stripe connect url.
	useEffect( () => {
		const stripeConnected =
			site?.options?.launchpad_checklist_tasks_statuses?.stripe_connected || false;
		if ( stripeConnected === false && site?.ID && flow === NEWSLETTER_FLOW ) {
			dispatch( membershipsRequestSettings( site?.ID, 'launchpad' ) );
		}
	}, [ site, flow, dispatch ] );

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
