import { getStaticSiteImportErrorCode } from '@automattic/api-core';
import { createStaticSiteImportSessionMutation } from '@automattic/api-queries';
import { Onboard, Visibility } from '@automattic/data-stores';
import { STATIC_SITE_IMPORT_FLOW, Step } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useHref, useLocation, useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { addSchemeIfMissing } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	getSignupCompleteFlowName,
	retrieveSignupDestination,
} from 'calypso/signup/storageUtils';
import type { Step as StepType } from '../../types';

export type StaticSiteImportReadingSubmits =
	{ action: 'continue'; importSessionId: string } | { action: 'unavailable' };

const StaticSiteImportReading: StepType< { submits: StaticSiteImportReadingSubmits } > =
	function StaticSiteImportReading( { navigation } ) {
		const { __ } = useI18n();
		const { siteSlug } = useSiteData();
		const { pathname } = useLocation();
		const path = useHref( pathname );
		const [ searchParams ] = useSearchParams();
		const from = searchParams.get( 'from' )?.trim();
		const sourceUrl = from
			? addSchemeIfMissing( from, 'https' ).replace( /^http:/i, 'https:' )
			: '';
		// Not `sessionId`: Stepper uses that param for its own flow state.
		const sessionId = searchParams.get( 'importSessionId' );
		const siteId = searchParams.get( 'siteId' );
		const [ checkoutDestination ] = useState( () => {
			try {
				return new URL( retrieveSignupDestination(), window.location.origin );
			} catch {
				return undefined;
			}
		} );
		const isCheckoutReturn =
			Boolean( siteId ) &&
			getSignupCompleteFlowName() === STATIC_SITE_IMPORT_FLOW &&
			checkoutDestination?.origin === window.location.origin &&
			checkoutDestination?.pathname === path &&
			[ 'siteId', 'siteSlug', 'from', 'platform', 'importSessionId' ].every(
				( key ) => checkoutDestination.searchParams.get( key ) === searchParams.get( key )
			);
		const shouldApplySiteSettings =
			isCheckoutReturn && checkoutDestination?.searchParams.get( 'applySiteSettings' ) === '1';
		const [ hasConfirmed, setHasConfirmed ] = useState( false );
		const needsConfirmation = ! isCheckoutReturn && ! hasConfirmed;

		const { mutate: createSession, error } = useMutation( createStaticSiteImportSessionMutation() );
		const isRefused = getStaticSiteImportErrorCode( error ) === 'static_site_import_source_refused';

		const submit = useEffectEvent( ( result: StaticSiteImportReadingSubmits ) =>
			navigation.submit?.( result )
		);
		const hasStarted = useRef( false );
		useEffect( () => {
			if ( needsConfirmation || hasStarted.current ) {
				return;
			}
			hasStarted.current = true;
			if ( ! sessionId && ! sourceUrl ) {
				return submit( { action: 'unavailable' } );
			}

			const startSession = async () => {
				try {
					if ( shouldApplySiteSettings ) {
						if ( ! siteId || ! Number.isSafeInteger( Number( siteId ) ) ) {
							return submit( { action: 'unavailable' } );
						}
						await Promise.all( [
							wpcom.req.post(
								{ path: `/sites/${ encodeURIComponent( siteId ) }/settings`, apiVersion: '1.4' },
								{},
								{
									blogname: __( 'My Site' ),
									blog_public: Visibility.PublicNotIndexed,
									wpcom_public_coming_soon: 1,
								}
							),
							wpcom.req.post(
								{
									path: `/sites/${ encodeURIComponent( siteId ) }/site-intent`,
									apiNamespace: 'wpcom/v2',
								},
								{},
								{ site_intent: Onboard.SiteIntent.SiteMigration }
							),
						] );
					}
				} catch {
					return submit( { action: 'unavailable' } );
				}

				if ( isCheckoutReturn ) {
					clearSignupDestinationCookie();
				}
				if ( sessionId ) {
					return submit( { action: 'continue', importSessionId: sessionId } );
				}

				createSession( sourceUrl, {
					onSuccess: ( session ) =>
						submit( { action: 'continue', importSessionId: session.session_id } ),
					onError: ( createError ) => {
						if (
							getStaticSiteImportErrorCode( createError ) !== 'static_site_import_source_refused'
						) {
							submit( { action: 'unavailable' } );
						}
					},
				} );
			};

			startSession();
		}, [
			__,
			createSession,
			isCheckoutReturn,
			needsConfirmation,
			sessionId,
			shouldApplySiteSettings,
			siteId,
			sourceUrl,
		] );

		if ( isRefused ) {
			return (
				<>
					<DocumentHead title={ __( 'We can’t import this site' ) } />
					<Step.CenteredColumnLayout
						columnWidth={ 8 }
						topBar={ <Step.TopBar /> }
						heading={
							<Step.Heading
								text={ __( 'We can’t import this site' ) }
								subText={ __( 'Its content isn’t allowed on WordPress.com.' ) }
							/>
						}
					/>
				</>
			);
		}

		if ( needsConfirmation ) {
			return (
				<>
					<DocumentHead title={ __( 'Import into this site' ) } />
					<Step.CenteredColumnLayout
						columnWidth={ 6 }
						topBar={
							<Step.TopBar leftElement={ <Step.BackButton onClick={ navigation.goBack } /> } />
						}
						heading={
							<Step.Heading
								text={
									siteSlug
										? sprintf(
												// translators: %s is the destination site's domain.
												__( 'Import into %s?' ),
												siteSlug
											)
										: __( 'Import into this site?' )
								}
								subText={ __( 'Importing will change this site’s content and design.' ) }
							/>
						}
					>
						{ sourceUrl && <p>{ sourceUrl }</p> }
						<Step.PrimaryButton onClick={ () => setHasConfirmed( true ) }>
							{ __( 'Import into this site' ) }
						</Step.PrimaryButton>
					</Step.CenteredColumnLayout>
				</>
			);
		}

		return (
			<>
				<DocumentHead title={ __( 'Checking your site' ) } />
				<Step.Loading title={ __( 'Checking your site' ) } />
			</>
		);
	};

export default StaticSiteImportReading;
