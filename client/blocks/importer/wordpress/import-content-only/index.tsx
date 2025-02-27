import { isEnabled } from '@automattic/calypso-config';
import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect, useCallback } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import { getImporterTypeForEngine, isTargetSitePlanCompatible } from 'calypso/blocks/importer/util';
import { WPImportOption } from 'calypso/blocks/importer/wordpress/types';
import { UpgradePlan } from 'calypso/blocks/importer/wordpress/upgrade-plan';
import { useDispatch } from 'calypso/state';
import { startImport, resetImport, startImporting } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import CompleteScreen from '../../components/complete-screen';
import ErrorMessage from '../../components/error-message';
import ImporterDrag from '../../components/importer-drag';
import { getImportDragConfig } from '../../components/importer-drag/config';
import ProgressScreen from '../../components/progress-screen';
import type { SiteDetails } from '@automattic/data-stores';
import type {
	Importer,
	ImportJob,
	ImportJobParams,
	StepNavigator,
} from 'calypso/blocks/importer/types';

import './style.scss';

type RenderState = 'idle' | 'progress' | 'upgrade-plan' | 'error' | 'success';

interface Props {
	job?: ImportJob;
	importer: Importer;
	siteItem: SiteDetails | null | undefined;
	siteSlug: string;
	siteAnalyzedData: UrlData | null;
	stepNavigator?: StepNavigator;
}

const ImportContentOnly: React.FunctionComponent< Props > = ( props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	/**
	 ↓ Fields
	 */
	const [ renderState, setRenderState ] = useState< RenderState >( 'idle' );
	const { job, importer, siteItem, siteSlug, siteAnalyzedData, stepNavigator } = props;
	const isSiteCompatible = siteItem && isTargetSitePlanCompatible( siteItem );
	const planName = getPlan( PLAN_BUSINESS )?.getTitle() || '';

	/**
	 ↓ Callbacks
	 */
	const prepareImportParams = useCallback( () => {
		const targetSiteUrl = siteSlug.startsWith( 'http' ) ? siteSlug : 'https://' + siteSlug;

		return {
			engine: importer,
			importerStatus: job as ImportJob,
			params: { engine: importer },
			site: { ID: siteItem?.ID as number },
			targetSiteUrl,
			supportedContent: [],
			unsupportedContent: [],
		} as ImportJobParams;
	}, [ siteItem, siteSlug, importer, job ] );

	const handleJobStateTransition = useCallback( () => {
		// If there is no existing import job, create a new job
		if ( job === undefined ) {
			dispatch( startImport( siteItem?.ID, getImporterTypeForEngine( importer ) ) );
		}
		// If the job is in a ready state, start the import process
		else if ( job.importerState === appStates.READY_FOR_UPLOAD ) {
			dispatch( importSite( prepareImportParams() ) );
		}
		// If the file type is a playground and the upload was successful, start the import process
		else if (
			isSiteCompatible &&
			job?.importerState === appStates.UPLOAD_SUCCESS &&
			job?.importerFileType === 'playground'
		) {
			dispatch( startImporting( job ) );
		}
	}, [ job ] );

	const decideRenderState = useCallback( () => {
		if (
			job?.importerState === appStates.IMPORTING ||
			// If the file type is a playground and the upload was successful, show the progress screen
			( isSiteCompatible &&
				job?.importerState === appStates.UPLOAD_SUCCESS &&
				job?.importerFileType === 'playground' )
		) {
			setRenderState( 'progress' );
		} else if ( job?.importerState === appStates.IMPORT_SUCCESS ) {
			setRenderState( 'success' );
		} else if ( job?.importerState === appStates.IMPORT_FAILURE ) {
			setRenderState( 'error' );
		} else if (
			! isSiteCompatible &&
			( job?.importerFileType === 'playground' || job?.importerFileType === 'jetpack_backup' )
		) {
			setRenderState( 'upgrade-plan' );
		} else {
			setRenderState( 'idle' );
		}
	}, [ job, isSiteCompatible ] );

	const onCompleteSiteViewClick = useCallback( () => {
		if (
			job?.importerFileType !== 'playground' &&
			isEnabled( 'onboarding/import-redirect-to-themes' )
		) {
			stepNavigator?.navigate?.( 'design-setup' );
		} else {
			stepNavigator?.goToSiteViewPage?.();
		}
	}, [ job ] );

	const onTryAgainClick = useCallback( () => {
		dispatch( resetImport( siteItem?.ID, job?.importerId ) );
		stepNavigator?.goToImportCapturePage?.();
	}, [ siteItem, job ] );

	const onBackToGoalsClick = useCallback( () => {
		dispatch( resetImport( siteItem?.ID, job?.importerId ) );
		stepNavigator?.goToGoalsPage?.();
	}, [] );

	/**
	 ↓ Effects
	 */
	useEffect( decideRenderState, [ decideRenderState ] );
	useEffect( handleJobStateTransition, [ handleJobStateTransition ] );

	/**
	 ↓ HTML Renders
	 */
	if ( ! siteItem ) {
		return null;
	}

	return (
		<div
			className={ clsx( 'import__import-content-only', {
				'import__error-message': renderState === 'error',
			} ) }
		>
			{ renderState === 'progress' && <ProgressScreen job={ job } /> }

			{ renderState === 'error' && (
				<ErrorMessage
					onPrimaryBtnClick={ onTryAgainClick }
					onSecondaryBtnClick={
						stepNavigator?.flow === 'site-setup' ? onBackToGoalsClick : undefined
					}
				/>
			) }

			{ renderState === 'upgrade-plan' && (
				<UpgradePlan
					site={ siteItem }
					ctaText={
						// translators: %(plan)s is the plan name - e.g. Business or Creator
						translate( 'Get %(plan)s', {
							args: {
								plan: planName,
							},
						} ) as string
					}
					subTitleText={
						// translators: %(plan)s is the plan name - e.g. Business or Creator
						translate( 'Importing a backup file requires a %(planName)s plan', {
							args: {
								planName,
							},
						} ) as string
					}
					isBusy={ false }
					onCtaClick={ () => {
						stepNavigator?.goToCheckoutPage?.( WPImportOption.CONTENT_ONLY );
					} }
					navigateToVerifyEmailStep={ () => {
						stepNavigator?.goToVerifyEmailPage?.();
					} }
				/>
			) }

			{ renderState === 'idle' && job && (
				<ImporterDrag
					site={ siteItem }
					urlData={ siteAnalyzedData }
					importerData={ getImportDragConfig( importer, stepNavigator?.supportLinkModal ) }
					importerStatus={ job }
				/>
			) }

			{ renderState === 'success' && (
				<CompleteScreen
					siteId={ siteItem.ID }
					siteSlug={ siteSlug }
					job={ job as ImportJob }
					buttonLabel={
						job?.importerFileType === 'playground' ? translate( 'View site' ) : undefined
					}
					resetImport={ () => {
						dispatch( resetImport( siteItem?.ID, job?.importerId ) );
					} }
					onSiteViewClick={ onCompleteSiteViewClick }
				/>
			) }
		</div>
	);
};

export default ImportContentOnly;
