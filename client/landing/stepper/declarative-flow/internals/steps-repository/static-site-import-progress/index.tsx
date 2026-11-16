import { useLocale } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { StaticSiteImportProgress } from 'calypso/dashboard/sites/overview-static-site-import/moving-card';
import { useStaticSiteImport } from 'calypso/dashboard/sites/overview-static-site-import/use-static-site-import';
import { getIntlLocale } from 'calypso/dashboard/utils/locale';
import { MoveLogos } from './move-logos';
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
	const locale = getIntlLocale( useLocale() );
	const siteImport = useStaticSiteImport( siteId ?? 0, importSessionId );
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

	return (
		<>
			<DocumentHead title={ __( 'We’re moving your site' ) } />
			<Step.WideLayout
				className="static-site-import-progress-step"
				topBar={ <Step.TopBar /> }
				heading={
					<Step.Heading
						text={ __( 'We’re bringing your site to WordPress.com' ) }
						subText={ __(
							'This can take 5 to 20 minutes. You don’t need to wait here: we’ll email you as soon as your site is ready.'
						) }
					/>
				}
			>
				<VStack spacing={ 8 }>
					<MoveLogos platform={ platform } />
					{ siteImport && (
						<StaticSiteImportProgress
							siteImport={ siteImport }
							search={ { importSessionId, from, platform } }
							locale={ locale }
						/>
					) }
				</VStack>
			</Step.WideLayout>
		</>
	);
};

export default StaticSiteImportProgressStep;
