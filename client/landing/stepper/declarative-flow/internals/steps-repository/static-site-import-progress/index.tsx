import { getStaticSiteImportErrorCode } from '@automattic/api-core';
import { createStaticSiteImportSessionMutation } from '@automattic/api-queries';
import { HelpCenter } from '@automattic/data-stores';
import { Step } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import {
	StaticSiteImportPreviewSteps,
	StaticSiteImportPreviewWindow,
} from 'calypso/dashboard/sites/static-site-import/moving-card';
import {
	getSourceHost,
	useStaticSiteImport,
} from 'calypso/dashboard/sites/static-site-import/use-static-site-import';
import { startWowFunnelSite } from 'calypso/landing/stepper/utils/wow-funnel-site';
import { addSchemeIfMissing } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import type { Step as StepType } from '../../types';

import './style.scss';

export type StaticSiteImportProgressStartedImport = {
	action: 'started';
	importSessionId: string;
	/** The preview site the import is delivered onto. */
	previewSiteId?: number;
	previewSiteSlug?: string;
	/** The source the move is copying, so a flow can tell it apart from another source's. */
	sourceUrl: string;
};

export type StaticSiteImportProgressStepSubmits =
	| StaticSiteImportProgressStartedImport
	| { action: 'finished' }
	| { action: 'stopped' }
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

const StaticSiteImportProgressStep: StepType< {
	accepts: {
		/** The source being moved, as the customer gave it. */
		from?: string;
		platform?: string;
		/** A move this step started before, such as before going back, to show instead of starting another. */
		startedImport?: StaticSiteImportProgressStartedImport;
	};
	submits: StaticSiteImportProgressStepSubmits;
} > = function StaticSiteImportProgressStep( { navigation, from, platform, startedImport } ) {
	const { __ } = useI18n();
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const email = useSelector( getCurrentUserEmail );
	const [ started, setStarted ] = useState( startedImport );
	const { mutate: createSession, error: sessionError } = useMutation(
		createStaticSiteImportSessionMutation()
	);
	const siteId = started?.previewSiteId ?? 0;
	const importSessionId = started?.importSessionId;
	// The preview was built for this move, which already names it as the destination.
	const siteImport = useStaticSiteImport( siteId, importSessionId, { approve: false } );
	const hasSubmitted = useRef( false );

	const status = siteImport?.status;
	const isRefused = siteImport?.isRefused;
	const isFinished = status === 'finished';

	const submit = useEffectEvent(
		( result: Exclude< StaticSiteImportProgressStepSubmits, { action: 'started' } > ) => {
			if ( hasSubmitted.current ) {
				return;
			}
			hasSubmitted.current = true;
			navigation.submit?.( result );
		}
	);

	// Starts the import session, then builds a preview site that the server delivers it onto as
	// soon as the build lands.
	const start = useEffectEvent( () => {
		const sourceUrl = from?.trim() ? addSchemeIfMissing( from.trim(), 'https' ) : '';
		if ( ! sourceUrl ) {
			return submit( { action: 'unavailable' } );
		}
		createSession( sourceUrl, {
			onSuccess: async ( session ) => {
				try {
					const preview = await startWowFunnelSite( {
						funnelSlug: PREVIEW_FUNNEL,
						funnelArgs: { import_session_id: session.session_id },
					} );
					const result: StaticSiteImportProgressStartedImport = {
						action: 'started',
						importSessionId: session.session_id,
						// Site creation returns the ID as a string, and the move looks up the preview by a numeric ID.
						previewSiteId: Number( preview.blogId ) || undefined,
						previewSiteSlug: preview.siteSlug,
						sourceUrl,
					};
					setStarted( result );
					// The flow keeps the move, so going back to this step shows it again.
					navigation.submit?.( result );
				} catch {
					submit( { action: 'preview_failed' } );
				}
			},
			onError: ( error ) =>
				! isRefusedError( error ) &&
				submit( { action: isWordPressSourceError( error ) ? 'migrate' : 'unavailable' } ),
		} );
	} );

	const hasStarted = useRef( false );
	useEffect( () => {
		if ( ! startedImport && ! hasStarted.current ) {
			hasStarted.current = true;
			start();
		}
	}, [ startedImport ] );

	useEffect( () => {
		if ( ! started ) {
			return;
		}
		if ( ! siteId || ! importSessionId ) {
			return submit( { action: 'stopped' } );
		}
		if ( isFinished ) {
			return submit( { action: 'finished' } );
		}
		// The dashboard explains a move that stopped, and offers what can be done about it.
		if ( isRefused || ( status && status !== 'moving' ) ) {
			submit( { action: 'stopped' } );
		}
	}, [ started, siteId, importSessionId, status, isFinished, isRefused ] );

	if ( isRefusedError( sessionError ) ) {
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
				</Step.CenteredColumnLayout>
			</>
		);
	}

	const sourceHost = getSourceHost( from );
	const search = { importSessionId, from, platform };

	return (
		<>
			<DocumentHead title={ __( 'Copying your site' ) } />
			<Step.WideLayout className="static-site-import-progress-step" topBar={ <Step.TopBar /> }>
				<div className="static-site-import-progress-step__split">
					<VStack spacing={ 8 } className="static-site-import-progress-step__main">
						<Step.Heading
							align="left"
							text={ __( 'Copying your site' ) }
							subText={
								sourceHost
									? sprintf(
											/* translators: %s: the domain of the site being copied, e.g. example.com. */
											__(
												'We’re copying %s into a private preview on WordPress.com. Your original site stays as it is.'
											),
											sourceHost
										)
									: __(
											'We’re copying your site into a private preview on WordPress.com. Your original site stays as it is.'
										)
							}
						/>
						{ siteImport && <StaticSiteImportPreviewSteps siteImport={ siteImport } /> }
						<p className="static-site-import-progress-step__email">
							{ email
								? createInterpolateElement(
										sprintf(
											/* translators: %s: the email address the ready email goes to, e.g. name@example.com. */
											__(
												'You can close this page. We’ll email you at <strong>%s</strong> when it’s done.'
											),
											email
										),
										{ strong: <strong /> }
									)
								: __( 'You can close this page. We’ll email you when it’s done.' ) }
						</p>
					</VStack>
					<aside className="static-site-import-progress-step__panel">
						{ siteImport && (
							<StaticSiteImportPreviewWindow siteImport={ siteImport } search={ search } />
						) }
					</aside>
				</div>
			</Step.WideLayout>
		</>
	);
};

export default StaticSiteImportProgressStep;
