import { StyleVariation } from '@automattic/design-picker';
import { setThemeOnSite } from '@automattic/onboarding';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { Progress, SenseiStepProgress } from '../components/sensei-step-progress';
import {
	getSelectedPlugins,
	saveSelectedPurposesAsSenseiSiteSettings,
} from '../sensei-purpose/purposes';
import { setAdminInterfaceStyle, wait } from './launch-completion-tasks';
import { useAtomicSiteChecklist } from './use-atomic-site-checklist';
import { useAtomicSitePlugins } from './use-atomic-site-plugins';
import { useSubSteps } from './use-sub-steps';
import type { Step } from '../../types';
import './style.scss';

type ResponseError = {
	error: string;
};

type Theme = {
	_links: {
		'wp:user-global-styles': { href: string }[];
	};
};

const SENSEI_PRO_PLUGIN_SLUG = 'sensei-pro';
const installCourseTheme = async ( siteId: number ) =>
	wpcom.req.post( { path: `/sites/${ siteId }/themes/course/install` } );

const getStyleVariations = ( siteId: number, stylesheet: string ): Promise< StyleVariation[] > =>
	wpcom.req.get( {
		path: `/sites/${ siteId }/global-styles/themes/${ stylesheet }/variations`,
		apiNamespace: 'wp/v2',
	} );

const getSiteTheme = ( siteId: number, stylesheet: string ): Promise< Theme > =>
	wpcom.req.get( {
		path: `/sites/${ siteId }/themes/${ stylesheet }`,
		apiNamespace: 'wp/v2',
	} );

const setStyleVariation = async (
	siteId: number,
	globalStylesId: number,
	globalStyles: StyleVariation
) => {
	await wpcom.req.post( {
		path: `/sites/${ siteId }/global-styles/${ globalStylesId }`,
		apiNamespace: 'wp/v2',
		body: {
			id: globalStylesId,
			settings: globalStyles.settings ?? {},
			styles: globalStyles.styles ?? {},
		},
	} );
};

const updateStyleVariation = async ( siteId: number, selectedVariation: string ) => {
	const [ styleVariations, theme ]: [ StyleVariation[], Theme ] = await Promise.all( [
		getStyleVariations( siteId, 'course' ),
		getSiteTheme( siteId, 'course' ),
	] );

	const userGlobalStylesLink: string =
		theme?._links?.[ 'wp:user-global-styles' ]?.[ 0 ]?.href || '';
	const userGlobalStylesId = parseInt( userGlobalStylesLink.split( '/' ).pop() || '', 10 );
	const styleVariation = styleVariations.find(
		( variation ) => variation.title?.toLowerCase() === selectedVariation
	);

	if ( styleVariation && userGlobalStylesId ) {
		await setStyleVariation( siteId, userGlobalStylesId, styleVariation );
	}
};

const SenseiLaunch: Step = ( { navigation: { submit } } ) => {
	const siteId = useSite()?.ID as number;
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;
	const urlParams = new URLSearchParams( window.location.search );
	const selectedVariation = urlParams.get( 'variation' ) ?? 'green';
	const { pollPlugins, isPluginInstalled, queuePlugin } = useAtomicSitePlugins();
	const { requestChecklist, isSenseiIncluded } = useAtomicSiteChecklist();
	const additionalPlugins = useMemo( () => getSelectedPlugins(), [] );

	const allPlugins = useMemo(
		() => [ SENSEI_PRO_PLUGIN_SLUG, ...additionalPlugins.map( ( p ) => p.slug ) ],
		[ additionalPlugins ]
	);
	const arePluginsInstalled = allPlugins.every( isPluginInstalled );

	const percentage = useSubSteps(
		[
			async function installAndActivateTheme( retries ) {
				try {
					await installCourseTheme( siteId );
					// SelectedStyleVariation is not supported on non Simple sites but it is for Simple sites.
					await setThemeOnSite( `${ siteId }`, 'pub/course', selectedVariation );
					await updateStyleVariation( siteId, selectedVariation );
					return true;
				} catch ( responseError: unknown ) {
					if ( ( responseError as ResponseError )?.error === 'theme_already_installed' ) {
						await setThemeOnSite( `${ siteId }`, 'pub/course', selectedVariation );
						await updateStyleVariation( siteId, selectedVariation );
						return true;
					}
				}

				await wait( 3000 );
				return retries >= 10;
			},
			async function queueAdditionalPlugins() {
				additionalPlugins.forEach( queuePlugin );
				return true;
			},
			async function waitForAllPlugins() {
				pollPlugins();
				await wait( 3000 );
				return arePluginsInstalled;
			},
			async function waitForJetpackTransfer( retries ) {
				// Calling requestChecklist() below is causing Jetpack Identity Crisis (IDC) if used too early, so we wait
				// a bit to give more time jetpack sync to complete.
				await wait( 5000 );
				return retries >= 3;
			},
			async function savePurposeData() {
				await saveSelectedPurposesAsSenseiSiteSettings( siteSlug );
				return true;
			},
			async function waitForChecklist() {
				requestChecklist();
				await wait( 5000 );
				return isSenseiIncluded();
			},
			async function switchToDefaultAdminPanelView() {
				await setAdminInterfaceStyle( siteId, 'wp-admin' );
				return true;
			},
			async function done() {
				setTimeout( () => submit?.(), 1000 );
				return true;
			},
		],
		{
			maxRetries: 25,
			onFail: () => submit?.(),
		}
	);

	const progress: Progress = {
		percentage,
		title: __( 'Installing Sensei' ),
		subtitle: __( 'Our flexible LMS to power your online courses' ),
	};

	if ( percentage > 50 ) {
		Object.assign( progress, {
			title: __( 'Setting up your new Sensei Home' ),
			subtitle: null,
		} );
	}

	return (
		<>
			<DocumentHead title={ progress.title } />
			<SenseiStepContainer stepName="senseiLaunch" recordTracksEvent={ recordTracksEvent }>
				<SenseiStepProgress progress={ progress } />
			</SenseiStepContainer>
		</>
	);
};

export default SenseiLaunch;
