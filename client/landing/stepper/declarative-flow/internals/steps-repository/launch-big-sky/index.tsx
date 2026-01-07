import { Onboard } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { Step } from '@automattic/onboarding';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, FormEvent } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { useSiteData } from '../../../../hooks/use-site-data';
import type { Step as StepType } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import '../processing-step/style.scss';
import './styles.scss';

const SiteIntent = Onboard.SiteIntent;

const LaunchBigSky: StepType = function ( props ) {
	const { flow } = props;
	const { __ } = useI18n();
	const { siteSlug, siteId, site } = useSiteData();
	const urlQuery = useQuery();
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
			await wpcomRequest( {
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
			window.location.assign( '/start' );
		}
	}, [ isEligible ] );

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
					wpcomRequest( {
						path: '/sites/' + selectedSiteId + '/pages',
						method: 'POST',
						apiNamespace: 'wp/v2',
						body: {
							title: 'Home',
							status: 'publish',
							content: '<!-- wp:paragraph -->\n<p>Hello world!</p>\n<!-- /wp:paragraph -->',
						},
					} )
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

				window.location.replace(
					`${ siteURL }/wp-admin/site-editor.php?canvas=edit&ai-step=spec&referrer=${ flow }${ promptParam }&source=${ flow }${ specIdParam }`
				);
			} catch ( error ) {
				window.location.replace( `/sites/${ selectedSiteSlug }` );
			}
		},
		[ assemblerThemeActive, hasStaticHomepage, setDesignOnSite, setStaticHomepageOnSite ]
	);

	const onSubmit = useCallback(
		async ( event: FormEvent ) => {
			event.preventDefault();
			setIntentOnSite( siteSlug, SiteIntent.AIAssembler );
			setGoalsOnSite( siteSlug, goals );
			exitFlow( siteId.toString(), siteSlug );
		},
		[ setIntentOnSite, siteSlug, setGoalsOnSite, goals, exitFlow, siteId ]
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
