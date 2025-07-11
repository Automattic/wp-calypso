import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { StepProps } from './types';

export default function Step3Send( { state }: StepProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isSendPreview, setIsSendPreview ] = useState( false );

	const { sendReportEmailMutation, reportId, isReportPending, isReportErrorStatus, isProcessed } =
		state;

	const handleSendPreview = useCallback( () => {
		if ( reportId ) {
			dispatch( recordTracksEvent( 'calypso_a4a_reports_send_report_preview_click' ) );
			setIsSendPreview( true );
			sendReportEmailMutation.mutate(
				{ reportId, preview: true },
				{
					onSettled: () => setIsSendPreview( false ),
				}
			);
		}
	}, [ reportId, sendReportEmailMutation, dispatch ] );

	const isSendingPreview = isSendPreview && sendReportEmailMutation.isPending;

	const loadingText = translate(
		'Please wait while we prepare your report. This may take a few minutes, depending on your data range and data selected. Do not navigate away from this screen.'
	);

	if ( reportId ) {
		if ( isReportPending ) {
			return (
				<>
					<h2 className="build-report__step-title" aria-current="step">
						{ translate( 'Step 3 of 3: Preparing your report' ) }
					</h2>
					<p
						className="build-report__loading-state build-report__content-description"
						role="status"
						aria-live="polite"
						aria-label={ loadingText }
					>
						<Spinner aria-hidden="true" />
						<span aria-hidden="true">{ loadingText }</span>
					</p>
				</>
			);
		}

		if ( isReportErrorStatus ) {
			return (
				<>
					<h2 className="build-report__step-title" aria-current="step">
						{ translate( 'Step 3 of 3: Report preparation failed' ) }
					</h2>
					<p className="build-report__step-description" role="alert" aria-live="assertive">
						{ state.reportErrorMetadata.errorText }
					</p>
				</>
			);
		}

		if ( isProcessed ) {
			return (
				<>
					<h2 className="build-report__step-title" aria-current="step">
						{ translate( 'Step 3 of 3: Send your report' ) }
					</h2>

					<p className="build-report__step-description" role="status" aria-live="polite">
						<span>
							{ translate(
								'Your report is ready for sending. Checkout the preview, then click "Send to client now".'
							) }
						</span>
						<span>{ translate( "We'll take it from there!" ) }</span>
					</p>
					<Button
						variant="secondary"
						onClick={ handleSendPreview }
						className="build-report__preview-button"
						isBusy={ isSendingPreview }
						disabled={ isSendingPreview }
					>
						{ isSendingPreview
							? translate( 'Sending preview…' )
							: translate( 'Send me a preview' ) }
					</Button>
				</>
			);
		}
	}
	return (
		<>
			<h2 className="build-report__step-title" aria-current="step">
				{ translate( 'Step 3 of 3: Unknown report status' ) }
			</h2>

			<p className="build-report__step-description" role="alert" aria-live="assertive">
				{ translate( 'There was an error preparing your report.' ) }
			</p>
		</>
	);
}
