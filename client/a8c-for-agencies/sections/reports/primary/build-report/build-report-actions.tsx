import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { addQueryArgs, getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { BuildReportState } from '../../types';

interface BuildReportActionsProps {
	currentStep: number;
	state: BuildReportState;
	handlers: {
		setCurrentStep: ( step: number ) => void;
		handleNextStep: () => void;
		handlePrevStep: () => void;
	};
}

export default function BuildReportActions( {
	currentStep,
	state,
	handlers,
}: BuildReportActionsProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isSendToClient, setIsSendToClient ] = useState( false );

	const {
		isDuplicateLoading,
		sendReportMutation,
		sendReportEmailMutation,
		reportId,
		isProcessed,
		isReportError,
	} = state;

	const { setCurrentStep, handleNextStep, handlePrevStep } = handlers;

	const handleBuildNewReport = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_build_new_after_error_click' ) );
		page.redirect( removeQueryArgs( window.location.pathname, 'reportId' ) );
		setCurrentStep( 1 );
	}, [ setCurrentStep, dispatch ] );

	const handleBackToStep2 = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_send_report_back_click' ) );
		// We need to replace the reportId with the sourceId so that
		// we can prefill the form with the previous data
		const currentReportId = getQueryArg( window.location.href, 'reportId' );
		const urlWithoutReportId = removeQueryArgs( window.location.pathname, 'reportId' );
		const urlWithSourceId = addQueryArgs( urlWithoutReportId, { sourceId: currentReportId } );
		page.redirect( urlWithSourceId );
		setCurrentStep( 2 );
	}, [ setCurrentStep, dispatch ] );

	const isCreatingReport = sendReportMutation.isPending;
	const isSendingReport = sendReportEmailMutation.isPending;
	const isLoadingState = isDuplicateLoading || isCreatingReport;

	const handleSendReport = useCallback( () => {
		if ( reportId ) {
			dispatch( recordTracksEvent( 'calypso_a4a_reports_send_to_client_now_click' ) );
			setIsSendToClient( true );
			sendReportEmailMutation.mutate(
				{ reportId },
				{
					onSettled: () => setIsSendToClient( false ),
				}
			);
		}
	}, [ reportId, sendReportEmailMutation, dispatch ] );

	const isBusySendingReport = isSendToClient && isSendingReport;

	return (
		<>
			{ currentStep < 2 && (
				<div className="build-report__actions">
					<Button
						variant="primary"
						onClick={ () => {
							dispatch(
								recordTracksEvent( 'calypso_a4a_reports_step_next_click', {
									from_step: currentStep,
								} )
							);
							handleNextStep();
						} }
						disabled={ isLoadingState }
					>
						{ translate( 'Next' ) }
					</Button>
				</div>
			) }
			{ currentStep === 2 && (
				<div className="build-report__actions">
					<Button
						variant="secondary"
						onClick={ () => {
							dispatch(
								recordTracksEvent( 'calypso_a4a_reports_step_back_click', {
									from_step: currentStep,
								} )
							);
							handlePrevStep();
						} }
						disabled={ isLoadingState }
					>
						{ translate( 'Back' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ () => {
							dispatch( recordTracksEvent( 'calypso_a4a_reports_prepare_report_click' ) );
							handleNextStep();
						} }
						isBusy={ isCreatingReport }
						disabled={ isLoadingState }
					>
						{ isCreatingReport ? translate( 'Preparing report…' ) : translate( 'Prepare report' ) }
					</Button>
				</div>
			) }
			{ currentStep === 3 && reportId && (
				<>
					{ isProcessed && (
						<div className="build-report__actions">
							<Button
								variant="secondary"
								onClick={ handleBackToStep2 }
								disabled={ isSendingReport }
							>
								{ translate( 'Back' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ handleSendReport }
								isBusy={ isBusySendingReport }
								disabled={ isBusySendingReport }
							>
								{ isBusySendingReport
									? translate( 'Sending…' )
									: translate( 'Send to client now' ) }
							</Button>
						</div>
					) }
					{ isReportError && (
						<div className="build-report__actions">
							<Button variant="primary" onClick={ handleBuildNewReport }>
								{ translate( 'Build a new report' ) }
							</Button>
						</div>
					) }
				</>
			) }
		</>
	);
}
