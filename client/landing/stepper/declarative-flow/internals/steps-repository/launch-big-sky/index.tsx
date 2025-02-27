import { ProgressBar } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { localizeUrl } from '@automattic/i18n-utils';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useEffect, FormEvent, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { useSiteData } from '../../../../hooks/use-site-data';
import '../processing-step/style.scss';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './styles.scss';

const SiteIntent = Onboard.SiteIntent;

const LaunchBigSky: Step = function () {
	const { __ } = useI18n();
	const [ isError, setError ] = useState( false );
	const [ progress, setProgress ] = useState( 0 );
	const { siteSlug, siteId, site } = useSiteData();
	const translate = useTranslate();
	const { isEligible, isLoading } = useIsBigSkyEligible();
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
		if ( ! isLoading && ! isEligible ) {
			window.location.assign( '/start' );
		}
	}, [ isLoading, isEligible ] );

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

			// Delete the existing boilerplate about page, always has a page ID of 1
			pendingActions.push( deletePage( selectedSiteId, 1 ) );

			try {
				const results = await Promise.all( pendingActions );
				const siteURL = results[ 0 ].URL;

				if ( ! hasStaticHomepage ) {
					const homePagePostId = results[ 1 ].id;
					await setStaticHomepageOnSite( selectedSiteId, homePagePostId );
				}
				setProgress( 75 );

				window.location.replace(
					`${ siteURL }/wp-admin/site-editor.php?canvas=edit&referrer=design-choices`
				);
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'An error occurred:', error );
				setError( true );
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
		if ( isError || ! isEligible || isLoading ) {
			return;
		}
		const syntheticEvent = {
			preventDefault: () => {},
			target: {
				elements: {},
			},
		} as unknown as FormEvent;
		onSubmit( syntheticEvent );
	}, [ isError, isEligible, isLoading, onSubmit ] );

	if ( isLoading || ! isEligible ) {
		return null;
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
