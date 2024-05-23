import { Onboard } from '@automattic/data-stores';
import { resolveSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, FormEvent } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useSiteData } from '../../../../hooks/use-site-data';
import useAIAssembler from '../pattern-assembler/hooks/use-ai-assembler';
import type { Step } from '../../types';

import './style.scss';

const SiteIntent = Onboard.SiteIntent;

const LoadingBigSky: Step = function ( props ) {
	const { goNext, goBack, submit } = props.navigation; // eslint-disable-line @typescript-eslint/no-unused-vars

	const { __ } = useI18n();

	const [ callAIAssembler, setPrompt, prompt, loading ] = useAIAssembler(); // eslint-disable-line @typescript-eslint/no-unused-vars

	const { siteSlug, siteId } = useSiteData();
	const { saveSiteSettings, setDesignOnSite, setStaticHomepageOnSite, setIntentOnSite } =
		useDispatch( SITE_STORE );

	const exitFlow = async ( selectedSiteId: string, selectedSiteSlug: string ) => {
		// console.log( selectedSiteId, selectedSiteSlug );
		if ( ! selectedSiteId || ! selectedSiteSlug ) {
			return;
		}

		saveSiteSettings( selectedSiteId, {
			wpcom_ai_site_prompt: prompt,
		} );

		const pendingActions = [
			resolveSelect( SITE_STORE ).getSite( selectedSiteId ), // To get the URL.
		];

		// TODO: Query if we are indeed missing home page before creating new one.
		// Create the homepage.
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

		// Set the assembler theme
		// This was throwing an error for me, but I left this in here:
		// ThemeNotFoundError: The specified theme was not found.
		pendingActions.push(
			setDesignOnSite( selectedSiteSlug, {
				theme: 'assembler',
			} )
		);

		Promise.all( pendingActions ).then( ( results ) => {
			// URL is in the results from the first promise.
			const siteURL = results[ 0 ].URL;
			const homePagePostId = results[ 1 ].id;
			// This will redirect and we will never resolve.
			setStaticHomepageOnSite( selectedSiteId, homePagePostId ).then( () =>
				window.location.assign(
					`${ siteURL }/wp-admin/site-editor.php?canvas=edit&postType=page&postId=${ homePagePostId }`
				)
			);
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
