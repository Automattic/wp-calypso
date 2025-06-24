import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
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

	const { isDuplicateLoading, sendReportMutation, reportId, isProcessed, isReportError } = state;

	const { setCurrentStep, handleNextStep, handlePrevStep } = handlers;

	const handleBuildNewReport = useCallback( () => {
		page.redirect( removeQueryArgs( window.location.pathname, 'reportId' ) );
		setCurrentStep( 1 );
	}, [ setCurrentStep ] );

	const handleBackToStep2 = useCallback( () => {
		page.redirect( removeQueryArgs( window.location.pathname, 'reportId' ) );
		setCurrentStep( 2 );
	}, [ setCurrentStep ] );

	const isCreatingReport = sendReportMutation.isPending;
	const isLoadingState = isDuplicateLoading || isCreatingReport;

	const handleSendReport = useCallback( () => {
		// TODO: Implement send report functionality
	}, [] );

	return (
		<>
			{ currentStep < 2 && (
				<div className="build-report__actions">
					<Button variant="primary" onClick={ handleNextStep } disabled={ isLoadingState }>
						{ translate( 'Next' ) }
					</Button>
				</div>
			) }
			{ currentStep === 2 && (
				<div className="build-report__actions">
					<Button variant="secondary" onClick={ handlePrevStep } disabled={ isLoadingState }>
						{ translate( 'Back' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ handleNextStep }
						isBusy={ isCreatingReport }
						disabled={ isLoadingState }
					>
						{ isCreatingReport ? translate( 'Preparing report…' ) : translate( 'Prepare Report' ) }
					</Button>
				</div>
			) }
			{ currentStep === 3 && reportId && (
				<>
					{ isProcessed && (
						<div className="build-report__actions">
							<Button variant="secondary" onClick={ handleBackToStep2 }>
								{ translate( 'Back' ) }
							</Button>
							<Button variant="primary" onClick={ handleSendReport }>
								{ translate( 'Send to client now' ) }
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
