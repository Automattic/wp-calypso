import { Button } from '@automattic/components';
import { Onboard } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { StepContainer } from '@automattic/onboarding';
import { resolveSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { useSiteData } from '../../../../hooks/use-site-data';
import type { Step } from '../../types';

const SiteIntent = Onboard.SiteIntent;

const LaunchBigSky: Step = function ( { navigation, flow, stepName } ) {
	const isBigSkyEligible = useIsBigSkyEligible();
	if ( ! isBigSkyEligible ) {
		window.location.assign( '/start' );
	}
	const { __ } = useI18n();
	const { goBack } = navigation;
	const headerText = __( 'Launch time' );

	const [ isError, setError ] = useState( false );
	const [ isLaunching, setIsLaunching ] = useState( false );

	const { siteSlug, siteId, site } = useSiteData();
	const { setDesignOnSite, setStaticHomepageOnSite, setIntentOnSite } = useDispatch( SITE_STORE );

	const hasStaticHomepage = site?.options?.show_on_front === 'page' && site?.options?.page_on_front;
	const assemblerThemeActive = site?.options?.theme_slug === 'pub/assembler';

	const exitFlow = async ( selectedSiteId: string, selectedSiteSlug: string ) => {
		if ( ! selectedSiteId || ! selectedSiteSlug ) {
			return;
		}

		const pendingActions = [
			resolveSelect( SITE_STORE ).getSite( selectedSiteId ), // To get the URL.
		];

		// Set the Assembler theme on the site.
		if ( ! assemblerThemeActive ) {
			setDesignOnSite( selectedSiteSlug, getAssemblerDesign() );
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
					},
				} )
			);
		}

		try {
			const results = await Promise.all( pendingActions );
			const siteURL = results[ 0 ].URL;

			if ( ! hasStaticHomepage ) {
				const homePagePostId = results[ 1 ].id;
				await setStaticHomepageOnSite( selectedSiteId, homePagePostId );
			}

			window.location.replace( `${ siteURL }/wp-admin/site-editor.php?canvas=edit` );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'An error occurred:', error );
			setError( true );
		} finally {
			setIsLaunching( false );
		}
	};

	const onSubmit = async ( event: FormEvent ) => {
		setIsLaunching( true );
		event.preventDefault();
		setIntentOnSite( siteSlug, SiteIntent.AIAssembler );
		exitFlow( siteId.toString(), siteSlug );
	};

	function LaunchingBigSky() {
		return (
			<div className="processing-step__container">
				<div className="processing-step">
					{ ! isError && <LoadingEllipsis /> }
					{ isError && (
						<p className="processing-step__error">
							{ __( 'Something unexpected happened. Please go back and try again.' ) }
						</p>
					) }
				</div>
			</div>
		);
	}

	return (
		<>
			<DocumentHead title={ headerText } />
			<StepContainer
				flowName={ flow }
				stepName={ stepName }
				isFullLayout
				formattedHeader={
					<FormattedHeader
						headerText={ headerText }
						subHeaderAlign="center"
						subHeaderText={ __( 'Big Sky is the AI website builder for WordPress.' ) }
					/>
				}
				stepContent={
					<>
						{ isLaunching && <LaunchingBigSky /> }
						<Button disabled={ isLaunching } busy={ isLaunching } primary onClick={ onSubmit }>
							{ __( 'Launch Big Sky' ) }
						</Button>
					</>
				}
				goBack={ goBack }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default LaunchBigSky;
