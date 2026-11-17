import { getStaticSiteImportErrorCode } from '@automattic/api-core';
import { createStaticSiteImportSessionMutation } from '@automattic/api-queries';
import { HelpCenter, Onboard, Visibility } from '@automattic/data-stores';
import { STATIC_SITE_IMPORT_FLOW, Step } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { isCheckoutExitPreview } from 'calypso/landing/stepper/declarative-flow/flows/static-site-import-flow/helpers';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { startWowFunnelSite } from 'calypso/landing/stepper/utils/wow-funnel-site';
import { recordSignupComplete, SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { addSchemeIfMissing } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupCompleteFlowName,
	clearSignupDestinationCookie,
	getSignupCompleteFlowName,
	getSignupIsNewUserAndClear,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import type { Step as StepType } from '../../types';

export type StaticSiteImportReadingSubmits =
	| { action: 'continue'; importSessionId: string; previewSiteSlug?: string }
	| { action: 'migrate' }
	| { action: 'unavailable' }
	| { action: 'preview_failed' };

/** The WoW funnel that builds a preview site for an import. */
const PREVIEW_FUNNEL = 'preview';

const HELP_CENTER_STORE = HelpCenter.register();

const isRefusedError = ( error: unknown ) =>
	getStaticSiteImportErrorCode( error ) === 'static_site_import_source_refused';

// The server found WordPress behind the source, which a site migration moves whole.
const isWordPressSourceError = ( error: unknown ) =>
	getStaticSiteImportErrorCode( error ) === 'static_site_import_source_is_wordpress';

const StaticSiteImportReading: StepType< { submits: StaticSiteImportReadingSubmits } > =
	function StaticSiteImportReading( { navigation } ) {
		const { __ } = useI18n();
		const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
		const { site, siteSlug } = useSiteData();
		const userId = useSelector( getCurrentUserId );
		const [ searchParams ] = useSearchParams();
		const from = searchParams.get( 'from' )?.trim();
		const sourceUrl = from ? addSchemeIfMissing( from, 'https' ) : '';
		// Not `sessionId`: Stepper uses that param for its own flow state.
		const sessionId = searchParams.get( 'importSessionId' );
		const siteId = Number( searchParams.get( 'siteId' ) );
		// The flow records itself for this tab before sending the user to checkout, where
		// they already chose this destination.
		const [ isCheckoutReturn ] = useState(
			() => siteId > 0 && getSignupCompleteFlowName() === STATIC_SITE_IMPORT_FLOW
		);
		const isNewSite = isCheckoutReturn && searchParams.get( 'newSite' ) === '1';
		const [ hasConfirmed, setHasConfirmed ] = useState( false );
		// Left checkout with no destination: the import gets a preview site, so there is nothing to confirm.
		const isPreview = isCheckoutExitPreview( searchParams );
		const needsConfirmation = ! isPreview && ! isCheckoutReturn && ! hasConfirmed;

		const { mutate: createSession, error } = useMutation( createStaticSiteImportSessionMutation() );

		const start = useEffectEvent( async () => {
			const submit = ( result: StaticSiteImportReadingSubmits ) => navigation.submit?.( result );
			if ( ! sessionId && ! sourceUrl ) {
				return submit( { action: 'unavailable' } );
			}

			if ( isCheckoutReturn ) {
				clearSignupCompleteFlowName();
				clearSignupDestinationCookie();
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
				// flow's site params, so apply them here. They don't block the import.
				await Promise.allSettled( [
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
			}

			// The server delivers the import onto the preview as soon as its build lands.
			const continueWith = async ( importSessionId: string ) => {
				if ( ! isPreview ) {
					return submit( { action: 'continue', importSessionId } );
				}
				try {
					const preview = await startWowFunnelSite( {
						funnelSlug: PREVIEW_FUNNEL,
						funnelArgs: { import_session_id: importSessionId },
					} );
					return submit( {
						action: 'continue',
						importSessionId,
						previewSiteSlug: preview.siteSlug,
					} );
				} catch {
					return submit( { action: 'preview_failed' } );
				}
			};

			if ( sessionId ) {
				return continueWith( sessionId );
			}
			createSession( sourceUrl, {
				onSuccess: ( session ) => continueWith( session.session_id ),
				onError: ( createError ) =>
					! isRefusedError( createError ) &&
					submit( { action: isWordPressSourceError( createError ) ? 'migrate' : 'unavailable' } ),
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
					>
						<Step.PrimaryButton onClick={ () => setShowHelpCenter( true ) }>
							{ __( 'Get help' ) }
						</Step.PrimaryButton>
						{ siteSlug && (
							<Step.SecondaryButton href={ dashboardLink( `/sites/${ siteSlug }` ) }>
								{ __( 'Go to your site' ) }
							</Step.SecondaryButton>
						) }
					</Step.CenteredColumnLayout>
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
