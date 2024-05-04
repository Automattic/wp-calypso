import { Onboard } from '@automattic/data-stores';
import { StepContainer, NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { TextareaControl } from '@wordpress/components';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteData } from '../../../../hooks/use-site-data';
import useAIAssembler from '../pattern-assembler/hooks/use-ai-assembler';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './style.scss';

const SiteIntent = Onboard.SiteIntent;

const ActionSection = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	flex-wrap: wrap;
	margin-top: 40px;

	@media ( max-width: 320px ) {
		align-items: center;
	}
`;

const StyledNextButton = styled( NextButton )`
	@media ( max-width: 320px ) {
		width: 100%;
		margin-bottom: 20px;
	}
`;

const AISitePrompt: Step = function ( props ) {
	const { goNext, goBack, submit } = props.navigation; // eslint-disable-line @typescript-eslint/no-unused-vars
	const [ isLaunchingBigSky, setIsLaunchingBigSky ] = useState( false );

	const { __ } = useI18n();
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const [ callAIAssembler, setPrompt, prompt, loading ] = useAIAssembler(); // eslint-disable-line @typescript-eslint/no-unused-vars

	const { siteSlug, siteId } = useSiteData();
	// const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const { saveSiteSettings, setDesignOnSite, setStaticHomepageOnSite, setIntentOnSite } =
		useDispatch( SITE_STORE );

	const exitFlow = async ( selectedSiteId: string, selectedSiteSlug: string ) => {
		// console.log( selectedSiteId, selectedSiteSlug );
		if ( ! selectedSiteId || ! selectedSiteSlug ) {
			return;
		}

		setIsLaunchingBigSky( true );

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

	function getContent() {
		return (
			<>
				<div className="site-prompt__instructions-container">
					<form onSubmit={ onSubmit }>
						<TextareaControl
							help={ __( 'Sharing more detail here will help AI understand your intent better.' ) }
							value={ prompt }
							onChange={ ( value ) => setPrompt( value ) }
							disabled={ loading }
						/>

						<ActionSection>
							{ loading && <LoadingEllipsis /> }
							{ ! loading && (
								<StyledNextButton type="submit" disabled={ loading || prompt.length < 16 }>
									{ __( 'Continue' ) }
								</StyledNextButton>
							) }
						</ActionSection>
					</form>
				</div>
			</>
		);
	}

	return (
		<div className="site-prompt__signup is-woocommerce-install">
			<div className="site-prompt__is-store-address">
				{ isLaunchingBigSky && <LaunchingBigSky /> }
				{ ! isLaunchingBigSky && (
					<StepContainer
						stepName="site-prompt"
						className={ `is-step-${ intent }` }
						skipButtonAlign="top"
						hideBack
						goNext={ goNext }
						isHorizontalLayout
						formattedHeader={
							<FormattedHeader
								id="site-prompt-header"
								headerText={ __( 'Tell us a bit about your web site or business.' ) }
								subHeaderText={ __(
									'We will create a home page template for you based on best practices for sites like yours.'
								) }
								align="left"
							/>
						}
						stepContent={ getContent() }
						recordTracksEvent={ recordTracksEvent }
					/>
				) }
			</div>
		</div>
	);
};

export default AISitePrompt;
