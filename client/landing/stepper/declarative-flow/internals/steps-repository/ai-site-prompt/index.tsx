import { Onboard } from '@automattic/data-stores';
import { resolveSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, FormEvent } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useSiteData } from '../../../../hooks/use-site-data';
import type { Step } from '../../types';

import './style.scss';

const SiteIntent = Onboard.SiteIntent;

const LoadingBigSky: Step = function () {
	const { __ } = useI18n();

	const { siteSlug, siteId, site } = useSiteData();
	const { setStaticHomepageOnSite, setIntentOnSite } = useDispatch( SITE_STORE );
	const hasStaticHomepage = site?.options?.show_on_front === 'page' && site?.options?.page_on_front;

	const exitFlow = async ( selectedSiteId: string, selectedSiteSlug: string ) => {
		if ( ! selectedSiteId || ! selectedSiteSlug ) {
			return;
		}

		const pendingActions = [
			resolveSelect( SITE_STORE ).getSite( selectedSiteId ), // To get the URL.
		];

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

		Promise.all( pendingActions ).then( ( results ) => {
			const siteURL = results[ 0 ].URL;

			if ( ! hasStaticHomepage ) {
				const homePagePostId = results[ 1 ].id;
				setStaticHomepageOnSite( selectedSiteId, homePagePostId ).then( () => {
					window.location.replace(
						`${ siteURL }/wp-admin/site-editor.php?canvas=edit&postType=page&postId=${ homePagePostId }`
					);
				} );
			} else {
				window.location.replace( `${ siteURL }/wp-admin/site-editor.php?canvas=edit` );
			}
			return Promise.resolve();
		} );
	};

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setIntentOnSite( siteSlug, SiteIntent.AIAssembler );
		exitFlow( siteId.toString(), siteSlug );
	};

	useEffect( () => {
		const syntheticEvent = {
			preventDefault: () => {},
			target: {
				elements: {},
			},
		} as unknown as FormEvent;
		onSubmit( syntheticEvent );
	}, [] );

	function LaunchingBigSky() {
		return (
			<div className="processing-step__container">
				<div className="processing-step">
					<h1 className="processing-step__progress-step">{ __( 'Launching Big Sky' ) }</h1>
					<LoadingEllipsis />
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
