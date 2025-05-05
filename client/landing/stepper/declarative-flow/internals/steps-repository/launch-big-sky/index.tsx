import { ProgressBar } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useEffect, FormEvent, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { useSiteData } from '../../../../hooks/use-site-data';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import '../processing-step/style.scss';
import './styles.scss';

const SiteIntent = Onboard.SiteIntent;

const LaunchBigSky: Step = function ( props ) {
	const { flow } = props;
	const { __ } = useI18n();
	const [ isError, setError ] = useState( false );
	const [ progress, setProgress ] = useState( 0 );
	const [ isExistingSite, setIsExistingSite ] = useState( false );
	const [ hasCheckedSite, setHasCheckedSite ] = useState( false );
	const [ showConfirmation, setShowConfirmation ] = useState( false );
	const { siteSlug, siteId, site } = useSiteData();
	const translate = useTranslate();
	const urlQuery = useQuery();
	const { isOwner, isEligiblePlan } = useIsBigSkyEligible( flow );
	const { setDesignOnSite, setStaticHomepageOnSite, setGoalsOnSite, setIntentOnSite } =
		useDispatch( SITE_STORE );
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[]
	);

	const hasStaticHomepage = site?.options?.show_on_front === 'page' && site?.options?.page_on_front;
	const assemblerThemeActive = site?.options?.theme_slug === 'pub/assembler';
	const siteName = site?.name || translate( 'your site' );

	const checkIfPageExists = async ( siteId: string, pageId: number ): Promise< boolean > => {
		try {
			await wpcomRequest( {
				path: '/sites/' + siteId + '/pages/' + pageId,
				method: 'GET',
				apiNamespace: 'wp/v2',
			} );
			return true;
		} catch ( error ) {
			return false;
		}
	};

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
			return false;
		}
	};

	useEffect( () => {
		if ( ! isOwner ) {
			window.location.assign( '/sites' );
		}
	}, [ isOwner ] );

	useEffect( () => {
		const checkSite = async () => {
			if ( ! siteId || hasCheckedSite ) {
				return;
			}

			try {
				const pageExists = await checkIfPageExists( siteId.toString(), 1 );
				// const pageExists = true;
				setIsExistingSite( ! pageExists );
				setShowConfirmation( ! pageExists );
				setHasCheckedSite( true );
			} catch ( error ) {
				setError( true );
			}
		};

		checkSite();
	}, [ siteId, hasCheckedSite ] );

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
				pendingActions.push(
					setDesignOnSite( selectedSiteSlug, getAssemblerDesign(), { enableThemeSetup: true } )
				);
			}
			setProgress( 25 );

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
			setProgress( 50 );

			// Only delete the about page for new sites (where page ID 1 exists)
			if ( ! isExistingSite ) {
				pendingActions.push( deletePage( selectedSiteId, 1 ) );
			}

			try {
				const results = await Promise.all( pendingActions );
				const siteURL = results[ 0 ].URL;

				const homePagePostId = results[ results.length - 1 ].id;
				await setStaticHomepageOnSite( selectedSiteId, homePagePostId );
				setProgress( 75 );

				const prompt = urlQuery.get( 'prompt' );
				let promptParam = '';

				if ( prompt ) {
					promptParam = `&prompt=${ encodeURIComponent( prompt ) }`;
				}

				window.location.replace(
					`${ siteURL }/wp-admin/site-editor.php?canvas=edit&referrer=${ flow }${ promptParam }&ai-step=onboarding`
				);
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'An error occurred:', error );
				setError( true );
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			assemblerThemeActive,
			hasStaticHomepage,
			setDesignOnSite,
			setStaticHomepageOnSite,
			isExistingSite,
		]
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
		if ( isError || ! isOwner || ! isEligiblePlan || ! hasCheckedSite || showConfirmation ) {
			return;
		}
		const syntheticEvent = {
			preventDefault: () => {},
			target: {
				elements: {},
			},
		} as unknown as FormEvent;
		onSubmit( syntheticEvent );
	}, [ isError, isOwner, isEligiblePlan, onSubmit, hasCheckedSite, showConfirmation ] );

	if ( ! isEligiblePlan ) {
		return (
			<div className="processing-step__container">
				<div className="confirmation-dialog step-container-v2__heading">
					<h1 className="wp-brand-font">{ translate( 'Upgrade your plan to use AI' ) }</h1>
					<p>
						{ translate(
							'To rebuild your site with AI, you need to upgrade to a paid plan. This will give you access to our AI-powered site builder and many other premium features.'
						) }
					</p>
					<div className="confirmation-dialog__actions">
						<Button variant="secondary" onClick={ () => window.history.back() }>
							{ translate( 'Not now' ) }
						</Button>
						<Button
							variant="primary"
							onClick={ () => {
								window.location.assign( `/setup/ai-site-builder/plans?siteId=${ siteId }` );
							} }
						>
							{ translate( 'View plans' ) }
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if ( showConfirmation ) {
		return (
			<div className="processing-step__container">
				<div className="confirmation-dialog step-container-v2__heading">
					<h1 className="wp-brand-font">
						{ translate( 'Rebuild %(siteName)s with AI?', {
							args: { siteName },
							components: {
								siteName: siteName,
							},
						} ) }
					</h1>
					<p>
						{ translate(
							'Continuing will overwrite theme settings. Some settings and customizations may not be restorable.'
						) }
					</p>
					<div className="confirmation-dialog__actions">
						<Button variant="secondary" onClick={ () => window.history.back() }>
							{ translate( 'Nevermind' ) }
						</Button>
						<Button
							variant="primary"
							onClick={ () => {
								setShowConfirmation( false );
								const syntheticEvent = {
									preventDefault: () => {},
									target: { elements: {} },
								} as unknown as FormEvent;
								onSubmit( syntheticEvent );
							} }
						>
							{ translate( 'Yes, rebuild my site' ) }
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="site-prompt__signup is-woocommerce-install">
			<div className="site-prompt__is-store-address">
				<div className="processing-step__container">
					<div className="processing-step">
						{ ! isError && <ProgressBar key="main-progress" value={ progress } compact /> }
						{ isError && (
							<p className="processing-step__error">
								{ __( 'Something unexpected happened. Please go back and try again.' ) }
							</p>
						) }
					</div>
					<div className="big-sky-disclaimer">
						<p>
							{ translate(
								'Please review our {{ai_guidelines}}AI Guidelines{{/ai_guidelines}} and the contents of your site to ensure it complies with our {{user_guidelines}}User Guidelines{{/user_guidelines}}.',
								{
									components: {
										ai_guidelines: (
											<a
												href={ localizeUrl( 'https://automattic.com/ai-guidelines/' ) }
												target="_blank"
												rel="noreferrer noopener"
												onClick={ ( event ) => {
													recordTracksEvent( 'calypso_big_sky_ai_guidelines_click' );
													event.stopPropagation();
												} }
											/>
										),
										user_guidelines: (
											<a
												href={ localizeUrl( 'https://wordpress.com/support/user-guidelines/' ) }
												target="_blank"
												rel="noreferrer noopener"
											/>
										),
										br: <br />,
									},
								}
							) }
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LaunchBigSky;
