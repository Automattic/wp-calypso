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
import { recordSignupComplete, SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { addSchemeIfMissing } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	getSignupIsNewUserAndClear,
	retrieveSignupDestination,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import type { Step as StepType } from '../../types';

export type StaticSiteImportReadingSubmits =
	{ action: 'continue'; importSessionId: string } | { action: 'unavailable' };

const isRefusedError = ( error: unknown ) =>
	getStaticSiteImportErrorCode( error ) === 'static_site_import_source_refused';

const StaticSiteImportReading: StepType< { submits: StaticSiteImportReadingSubmits } > =
	function StaticSiteImportReading( { navigation } ) {
		const { __ } = useI18n();
		const { site, siteSlug } = useSiteData();
		const userId = useSelector( getCurrentUserId );
		const path = useHref( useLocation().pathname );
		const [ searchParams ] = useSearchParams();
		const from = searchParams.get( 'from' )?.trim();
		const sourceUrl = from
			? addSchemeIfMissing( from, 'https' ).replace( /^http:/i, 'https:' )
			: '';
		// Not `sessionId`: Stepper uses that param for its own flow state.
		const sessionId = searchParams.get( 'importSessionId' );
		const siteId = Number( searchParams.get( 'siteId' ) );
		// Checkout returns to the URL the flow saved for it, so a match means the user
		// already chose this destination there.
		const [ isCheckoutReturn ] = useState( () => {
			try {
				const destination = new URL(
					( retrieveSignupDestination() ?? '' ).replaceAll( ':siteId', String( siteId ) ),
					window.location.origin
				);
				return (
					siteId > 0 &&
					destination.pathname === path &&
					[ ...destination.searchParams ].every(
						( [ key, value ] ) => searchParams.get( key ) === value
					)
				);
			} catch {
				return false;
			}
		} );
		const isNewSite = isCheckoutReturn && searchParams.get( 'newSite' ) === '1';
		const [ hasConfirmed, setHasConfirmed ] = useState( false );
		const needsConfirmation = ! isCheckoutReturn && ! hasConfirmed;

		const { mutate: createSession, error } = useMutation( createStaticSiteImportSessionMutation() );

		const start = useEffectEvent( async () => {
			const submit = ( result: StaticSiteImportReadingSubmits ) => navigation.submit?.( result );
			if ( ! sessionId && ! sourceUrl ) {
				return submit( { action: 'unavailable' } );
			}

			if ( isNewSite ) {
				recordSignupComplete(
					{
						flow: STATIC_SITE_IMPORT_FLOW,
						siteId,
						isNewUser: Boolean( getSignupIsNewUserAndClear( userId ) ),
						hasCartItems: true,
						planProductSlug: site?.plan?.product_slug,
						domainProductSlug: undefined,
						intent: STATIC_SITE_IMPORT_FLOW,
						startingPoint: STATIC_SITE_IMPORT_FLOW,
						signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.NOT_SET,
						framework: 'stepper',
						theme: undefined,
						isBlankCanvas: undefined,
						isTransfer: undefined,
						isMapping: undefined,
						goals: undefined,
					},
					true
				);
				// Logged-in checkout creates the site during the transaction without the
				// flow's site params, so apply them here.
				try {
					await Promise.all( [
						wpcom.req.post(
							{ path: `/sites/${ siteId }/settings`, apiVersion: '1.4' },
							{},
							{
								blogname: __( 'My Site' ),
								blog_public: Visibility.PublicNotIndexed,
								wpcom_public_coming_soon: 1,
							}
						),
						wpcom.req.post(
							{ path: `/sites/${ siteId }/site-intent`, apiNamespace: 'wpcom/v2' },
							{},
							{ site_intent: Onboard.SiteIntent.SiteMigration }
						),
					] );
				} catch {
					return submit( { action: 'unavailable' } );
				}
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
				onError: ( createError ) =>
					! isRefusedError( createError ) && submit( { action: 'unavailable' } ),
			} );
		} );
		const hasStarted = useRef( false );
		useEffect( () => {
			if ( ! needsConfirmation && ! hasStarted.current ) {
				hasStarted.current = true;
				start();
			}
		}, [ needsConfirmation ] );

		if ( isRefusedError( error ) ) {
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
