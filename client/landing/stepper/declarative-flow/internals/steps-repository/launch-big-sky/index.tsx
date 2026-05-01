import { fetchBigSkyPlugin, updateBigSkyPlugin } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { Onboard } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { Step } from '@automattic/onboarding';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, FormEvent } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { useSiteData } from '../../../../hooks/use-site-data';
import type { Step as StepType } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import '../processing-step/style.scss';
import './styles.scss';

const SiteIntent = Onboard.SiteIntent;

async function waitForRemoteOptionReady( siteId: number ): Promise< void > {
	const TIMEOUT_MS = 30_000;
	const POLL_INTERVAL_MS = 2_500;
	const severity = config( 'env_id' ) === 'production' ? 'error' : 'debug';
	const start = Date.now();

	while ( Date.now() - start < TIMEOUT_MS ) {
		try {
			const status = await fetchBigSkyPlugin( siteId );
			if ( status?.remote_option_ready !== false ) {
				logToLogstash( {
					feature: 'calypso_client',
					message: 'Big Sky remote option ready',
					severity: 'debug',
					blog_id: siteId,
					properties: {
						type: 'big_sky_remote_option_ready',
						duration_ms: Date.now() - start,
					},
				} );
				return;
			}
		} catch ( error ) {
			logToLogstash( {
				feature: 'calypso_client',
				message: 'Error polling for Big Sky remote option readiness',
				severity,
				blog_id: siteId,
				properties: {
					type: 'big_sky_remote_option_poll_error',
					error: error instanceof Error ? error.message : String( error ),
				},
			} );
		}
		await new Promise< void >( ( resolve ) => setTimeout( resolve, POLL_INTERVAL_MS ) );
	}

	logToLogstash( {
		feature: 'calypso_client',
		message: 'Timed out waiting for Big Sky remote option readiness',
		severity,
		blog_id: siteId,
		properties: {
			type: 'big_sky_remote_option_ready_timeout',
			timeout_ms: TIMEOUT_MS,
		},
	} );
}

const LaunchBigSky: StepType = function ( props ) {
	const { flow } = props;
	const { __ } = useI18n();
	const { siteSlug, siteId, site } = useSiteData();
	const urlQuery = useQuery();
	const ref = urlQuery.get( 'ref' );
	const { isEligible } = useIsBigSkyEligible( flow );
	const { setDesignOnSite, setStaticHomepageOnSite, setGoalsOnSite, setIntentOnSite } =
		useDispatch( SITE_STORE );
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[]
	);
	const hasStaticHomepage = site?.options?.show_on_front === 'page' && site?.options?.page_on_front;
	const assemblerThemeActive = site?.options?.theme_slug === 'pub/assembler';

	const deletePage = async ( siteId: string, pageId: number ): Promise< boolean > => {
		try {
			await wpcom.req.post( {
				path: '/sites/' + siteId + '/pages/' + pageId,
				method: 'DELETE',
				apiNamespace: 'wp/v2',
			} );
			return true;
		} catch ( error ) {
			// fail silently here, just log an error and return false, Big Sky will still launch
			// eslint-disable-next-line no-console
			console.error( `Failed to delete page ${ pageId } for site ${ siteId }:`, error );
			return false;
		}
	};

	useEffect( () => {
		if ( ! isEligible ) {
			window.location.replace( `/sites/${ siteSlug }` );
		}
	}, [ isEligible, siteSlug ] );

	const exitFlow = useCallback(
		async ( selectedSiteId: string, selectedSiteSlug: string ) => {
			if ( ! selectedSiteId || ! selectedSiteSlug ) {
				return;
			}

			const pendingActions = [
				resolveSelect( SITE_STORE ).getSite( selectedSiteId ), // To get the URL.
			];

			// Set the Assembler theme on the site.
			if ( ! assemblerThemeActive ) {
				setDesignOnSite( selectedSiteSlug, getAssemblerDesign(), { enableThemeSetup: true } );
			}

			// Create a new home page if one is not set yet.
			if ( ! hasStaticHomepage ) {
				pendingActions.push(
					wpcom.req.post(
						{
							path: '/sites/' + selectedSiteId + '/pages',
							apiNamespace: 'wp/v2',
						},
						{},
						{
							title: 'Home',
							status: 'publish',
							content: '<!-- wp:paragraph -->\n<p>Hello world!</p>\n<!-- /wp:paragraph -->',
						}
					)
				);
			}

			// Delete the existing boilerplate about page, always has a page ID of 1
			pendingActions.push( deletePage( selectedSiteId, 1 ) );

			try {
				const results = await Promise.all( pendingActions );
				const siteURL = results[ 0 ].URL;

				if ( ! hasStaticHomepage ) {
					const homePagePostId = results[ 1 ].id;
					await setStaticHomepageOnSite( selectedSiteId, homePagePostId );
				}

				const prompt = urlQuery.get( 'prompt' );
				let promptParam = '';

				if ( prompt ) {
					promptParam = `&prompt=${ encodeURIComponent( prompt ) }`;
				}

				const specId = urlQuery.get( 'spec_id' );
				let specIdParam = '';

				if ( specId ) {
					specIdParam = `&spec_id=${ encodeURIComponent( specId ) }`;
				}

				const source = ref === WOO_HOSTING_SOLUTIONS_REF ? 'woo-hosting-solutions' : flow;

				window.location.replace(
					`${ siteURL }/wp-admin/site-editor.php?canvas=edit&ai-step=spec&referrer=${ flow }${ promptParam }&source=${ source }${ specIdParam }`
				);
			} catch ( error ) {
				window.location.replace( `/sites/${ selectedSiteSlug }` );
			}
		},
		[
			flow,
			urlQuery,
			ref,
			assemblerThemeActive,
			hasStaticHomepage,
			setDesignOnSite,
			setStaticHomepageOnSite,
		]
	);

	const onSubmit = useCallback(
		async ( event: FormEvent ) => {
			event.preventDefault();
			await Promise.all( [
				setIntentOnSite( siteSlug, SiteIntent.AIAssembler ),
				updateBigSkyPlugin( siteId, { enable: true, setup_assembler_theme: true } ),
			] );
			// Poll until the async job that sets big_sky_enable on the remote site has
			// completed.
			await waitForRemoteOptionReady( siteId );
			setGoalsOnSite( siteSlug, goals );
			exitFlow( siteId.toString(), siteSlug );
		},
		[ setIntentOnSite, siteSlug, siteId, setGoalsOnSite, goals, exitFlow ]
	);

	useEffect( () => {
		if ( ! isEligible ) {
			return;
		}
		const syntheticEvent = {
			preventDefault: () => {},
			target: {
				elements: {},
			},
		} as unknown as FormEvent;
		onSubmit( syntheticEvent );
	}, [ isEligible, onSubmit ] );

	if ( ! isEligible ) {
		return null;
	}

	return (
		<>
			<DocumentHead title={ __( 'Processing' ) } />
			<Step.Loading />
		</>
	);
};

export default LaunchBigSky;
