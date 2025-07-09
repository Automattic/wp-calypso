import page from '@automattic/calypso-router';
import { Spinner } from '@wordpress/components';
import { Icon, error } from '@wordpress/icons';
import { getQueryArg, addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useEffect } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import {
	A4A_REPORTS_LINK,
	A4A_REPORTS_BUILD_LINK,
	A4A_REPORTS_DASHBOARD_LINK,
} from '../../constants';
import { useFormValidation } from '../../hooks/use-build-report-form-validation';
import { useDuplicateReportFormData } from '../../hooks/use-duplicate-report-form-data';
import usePollReportStatus from '../../hooks/use-poll-report-status';
import { useReportError } from '../../hooks/use-report-error';
import useSendReportEmailMutation from '../../hooks/use-send-report-email-mutation';
import useSendReportMutation from '../../hooks/use-send-report-mutation';
import BuildReportActions from './build-report-actions';
import BuildReportContent from './build-report-content';
import type { BuildReportState } from '../../types';

import './style.scss';

const BuildReport = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ currentStep, setCurrentStep ] = useState( 1 );

	const {
		formData,
		handlers,
		isLoading: isDuplicateLoading,
		isDuplicating,
		error: duplicateError,
	} = useDuplicateReportFormData();

	const sendReportMutation = useSendReportMutation( {
		onSuccess: ( data ) => {
			page.redirect( addQueryArgs( A4A_REPORTS_BUILD_LINK, { reportId: data.id } ) );
		},
		onError: ( error ) => {
			dispatch(
				errorNotice( error?.message || translate( 'Failed to prepare report. Please try again.' ), {
					duration: 8000,
					id: 'prepare-report-error',
				} )
			);
		},
	} );

	const sendReportEmailMutation = useSendReportEmailMutation( {
		onSuccess: ( _data, options ) => {
			const isPreview = options?.preview;
			dispatch(
				successNotice(
					isPreview
						? translate( 'Report preview sent successfully!' )
						: translate( 'Report sent successfully!' ),
					{
						duration: 5000,
						id: isPreview ? 'send-report-preview-success' : 'send-report-success',
						displayOnNextPage: ! isPreview,
					}
				)
			);
			if ( ! isPreview ) {
				page.redirect( A4A_REPORTS_DASHBOARD_LINK );
			}
		},
		onError: ( error ) => {
			dispatch(
				errorNotice( error?.message || translate( 'Failed to send report. Please try again.' ), {
					duration: 8000,
					id: 'send-report-error',
				} )
			);
		},
	} );

	const reportId = getQueryArg( window.location.href, 'reportId' ) as unknown as number;

	// Poll report status when reportId exists
	const {
		data: reportData,
		isProcessed,
		isError: isReportError,
		isPending: isReportPending,
		isErrorStatus: isReportErrorStatus,
	} = usePollReportStatus( reportId );

	const reportErrorMetadata = useReportError( reportData );

	useEffect( () => {
		if ( reportId ) {
			setCurrentStep( 3 );
		}
	}, [ reportId ] );

	const title = isDuplicating ? translate( 'Duplicate Report' ) : translate( 'Build Report' );

	const [ showValidationErrors, setShowValidationErrors ] = useState( false );

	// Get validation errors for current step
	const validationErrors = useFormValidation( currentStep, formData );
	const hasErrors = validationErrors.length > 0;

	const handleNextStep = useCallback( () => {
		setShowValidationErrors( true );

		if ( hasErrors ) {
			// Focus on first error field for accessibility
			const firstError = validationErrors[ 0 ];
			const errorElement = document.querySelector( `[data-field="${ firstError.field }"]` );
			if ( errorElement ) {
				( errorElement as HTMLElement ).focus();
			}
			return;
		}

		setShowValidationErrors( false );

		// If moving from step 2, create the report
		if ( currentStep === 2 ) {
			sendReportMutation.mutate( formData );
		} else {
			setCurrentStep( ( prev ) => prev + 1 );
		}
	}, [ hasErrors, validationErrors, currentStep, sendReportMutation, formData ] );

	const handlePrevStep = useCallback( () => {
		setShowValidationErrors( false );
		setCurrentStep( ( prev ) => prev - 1 );
	}, [] );

	const state: BuildReportState = {
		isDuplicateLoading,
		sendReportMutation,
		sendReportEmailMutation,
		reportId,
		isReportPending,
		isReportErrorStatus,
		isProcessed,
		showValidationErrors,
		validationErrors,
		isReportError,
		reportData,
		reportErrorMetadata,
	};

	return (
		<Layout className="build-report" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: translate( 'Client Reports' ),
								href: A4A_REPORTS_LINK,
							},
							{
								label: title,
							},
						] }
					/>
					<Actions useColumnAlignment>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div className="build-report__content">
					<div className="build-report__content-header">
						<h1 className="build-report__content-title">{ title }</h1>
						<p className="build-report__content-description">
							{ isDuplicating
								? translate(
										'Start with your previous send. All fields are filled in. Just make updates for the new report and send.'
								  )
								: translate(
										'Get started by choosing the details to include for your client below.'
								  ) }
						</p>
						{ isDuplicating && (
							<>
								{ duplicateError && ! isDuplicateLoading && (
									<div className="build-report__content-note">
										<Icon icon={ error } />
										{ translate( 'Note: Some data could not be duplicated.' ) }
									</div>
								) }
								{ isDuplicateLoading && (
									<div className="build-report__content-note">
										<Spinner /> { translate( 'Please wait while we prepare your report…' ) }
									</div>
								) }
							</>
						) }
					</div>
					<div className="build-report__form">
						<BuildReportContent
							currentStep={ currentStep }
							formData={ formData }
							state={ state }
							handlers={ handlers }
						/>
						<BuildReportActions
							currentStep={ currentStep }
							state={ state }
							handlers={ {
								setCurrentStep,
								handleNextStep,
								handlePrevStep,
							} }
						/>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
};

export default BuildReport;
