import { Step } from '@automattic/onboarding';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import {
	StaticSiteImportPreviewSteps,
	StaticSiteImportPreviewWindow,
} from 'calypso/dashboard/sites/overview-static-site-import/moving-card';
import {
	getSourceHost,
	useStaticSiteImport,
} from 'calypso/dashboard/sites/overview-static-site-import/use-static-site-import';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import type { Step as StepType } from '../../types';

import './style.scss';

export type StaticSiteImportProgressStepSubmits =
	{ action: 'finished'; previewUrl?: string } | { action: 'stopped' };

// The share link is made when the build lands, so wait a little for it before going on without it.
const PREVIEW_URL_WAIT = 30_000;

const StaticSiteImportProgressStep: StepType< {
	accepts: {
		/** The site the import is delivered onto. */
		siteId?: number;
		importSessionId?: string;
		/** The source being moved, as the customer gave it. */
		from?: string;
		platform?: string;
	};
	submits: StaticSiteImportProgressStepSubmits;
} > = function StaticSiteImportProgressStep( {
	navigation,
	siteId,
	importSessionId,
	from,
	platform,
} ) {
	const { __ } = useI18n();
	const email = useSelector( getCurrentUserEmail );
	// The preview was built for this move, which already names it as the destination.
	const siteImport = useStaticSiteImport( siteId ?? 0, importSessionId, { approve: false } );
	const [ hasWaitedForPreviewUrl, setHasWaitedForPreviewUrl ] = useState( false );
	const hasSubmitted = useRef( false );

	const status = siteImport?.status;
	const isRefused = siteImport?.isRefused;
	const isPreview = siteImport?.isPreview;
	const previewUrl = siteImport?.previewUrl;

	const submit = useEffectEvent( ( result: StaticSiteImportProgressStepSubmits ) => {
		if ( hasSubmitted.current ) {
			return;
		}
		hasSubmitted.current = true;
		navigation.submit?.( result );
	} );

	const isFinished = status === 'finished';
	useEffect( () => {
		if ( ! isFinished || previewUrl ) {
			return;
		}
		const timer = setTimeout( () => setHasWaitedForPreviewUrl( true ), PREVIEW_URL_WAIT );
		return () => clearTimeout( timer );
	}, [ isFinished, previewUrl ] );

	useEffect( () => {
		if ( ! siteId || ! importSessionId ) {
			return submit( { action: 'stopped' } );
		}
		if ( status === 'finished' ) {
			if ( previewUrl || isPreview === false || hasWaitedForPreviewUrl ) {
				submit( { action: 'finished', previewUrl } );
			}
			return;
		}
		// The dashboard explains a move that stopped, and offers what can be done about it.
		if ( isRefused || ( status && status !== 'moving' ) ) {
			submit( { action: 'stopped' } );
		}
	}, [
		siteId,
		importSessionId,
		status,
		isRefused,
		isPreview,
		previewUrl,
		hasWaitedForPreviewUrl,
	] );

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
