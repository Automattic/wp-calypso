import { Onboard } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { resolveSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, FormEvent, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useSiteData } from '../../../../hooks/use-site-data';
import type { Step } from '../../types';

import './style.scss';

const SiteIntent = Onboard.SiteIntent;

const LoadingBigSky: Step = function () {
	const { __ } = useI18n();
	const [ isError, setError ] = useState( false );
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
					path: '/sites/' + selectedSiteId + '/pagess',
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
		}
	};

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setIntentOnSite( siteSlug, SiteIntent.AIAssembler );
		exitFlow( siteId.toString(), siteSlug );
	};

	useEffect( () => {
		if ( isError ) {
			return;
		}
		const syntheticEvent = {
			preventDefault: () => {},
			target: {
				elements: {},
			},
		} as unknown as FormEvent;
		onSubmit( syntheticEvent );
	}, [ isError ] );

	function LaunchingBigSky() {
		return (
			<div className="processing-step__container">
				<div className="processing-step">
					<h1 className="processing-step__progress-step">{ __( 'Launching Big Sky' ) }</h1>
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
		<div className="site-prompt__signup is-woocommerce-install">
			<div className="site-prompt__is-store-address">
				<LaunchingBigSky />
			</div>
		</div>
	);
};

export default LoadingBigSky;
