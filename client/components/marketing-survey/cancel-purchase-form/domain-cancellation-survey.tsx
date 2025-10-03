import { localizeUrl } from '@automattic/i18n-utils';
import { TRANSFER_DOMAIN_REGISTRATION, UPDATE_NAMESERVERS } from '@automattic/urls';
import { Button, SelectControl, TextareaControl } from '@wordpress/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useState, useEffect, useMemo } from 'react';
import * as React from 'react';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import FormattedHeader from 'calypso/components/formatted-header';
import { getName } from 'calypso/lib/purchases';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import enrichedSurveyData from './enriched-survey-data';
import type { Purchase } from 'calypso/lib/purchases/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	disableButtons?: boolean;
	purchase: Purchase;
	purchaseListUrl: string;
	isVisible: boolean;
	onClose: () => void;
	onSurveyComplete: () => void;
	cancellationInProgress?: boolean;
}

interface DomainCancellationReason {
	value: string;
	label: TranslateResult;
	helpMessage?: TranslateResult;
	showTextarea?: boolean;
	showLink?: boolean;
	linkUrl?: string;
	linkText?: string;
}

const DomainCancellationSurvey: React.FC< Props > = ( {
	isVisible = false,
	purchase,
	...props
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ selectedReason, setSelectedReason ] = useState< string >( '' );
	const [ message, setMessage ] = useState< string >( '' );

	// Domain-specific cancellation reasons (simplified - no "keep domain" messaging)
	const cancellationReasons: DomainCancellationReason[] = useMemo(
		() => [
			{
				value: 'misspelled',
				label: String( translate( 'I misspelled the domain' ) ),
			},
			{
				value: 'other_host',
				label: String( translate( 'I want to use the domain with another service or host' ) ),
				showLink: true,
				linkUrl: UPDATE_NAMESERVERS,
				linkText: String( translate( 'update your name servers' ) ),
			},
			{
				value: 'transfer',
				label: String( translate( 'I want to transfer my domain to another registrar' ) ),
				showLink: true,
				linkUrl: TRANSFER_DOMAIN_REGISTRATION,
				linkText: String( translate( 'use our transfer out feature' ) ),
			},
			{
				value: 'expectations',
				label: String( translate( "The service isn't what I expected" ) ),
			},
			{
				value: 'wanted_free',
				label: String( translate( 'I meant to get a free blog' ) ),
				showTextarea: true,
			},
			{
				value: 'other',
				label: String( translate( 'Something not listed here' ) ),
				showTextarea: true,
			},
		],
		[ translate ]
	);

	// Reset state when dialog opens/closes
	useEffect( () => {
		if ( ! isVisible ) {
			setSelectedReason( '' );
			setMessage( '' );
		}
	}, [ isVisible ] );

	const handleCloseDialog = () => {
		props.onClose();
		recordTracksEvent( 'calypso_domain_cancel_survey_close', {
			product_slug: purchase.productSlug,
		} );
	};

	const handleSubmit = () => {
		if ( selectedReason ) {
			const surveyData = {
				'domain-cancel-reason': {
					response: selectedReason,
					text: message,
				},
				type: 'cancel',
			};

			dispatch(
				submitSurvey(
					'calypso-cancel-domain',
					purchase.siteId,
					enrichedSurveyData( surveyData, purchase )
				)
			);
		}

		recordTracksEvent( 'calypso_domain_cancel_survey_submit', {
			product_slug: purchase.productSlug,
			reason: selectedReason,
		} );

		// Call onSurveyComplete to trigger success notice and redirect
		if ( props.onSurveyComplete ) {
			props.onSurveyComplete();
		}
	};

	const selectedReasonData = useMemo( () => {
		return cancellationReasons.find( ( reason ) => reason.value === selectedReason );
	}, [ selectedReason, cancellationReasons ] );

	const renderButtons = () => {
		const { disableButtons, cancellationInProgress } = props;
		const disabled = disableButtons || ! selectedReason;

		return (
			<div className="cancel-purchase-form__actions">
				<div className="cancel-purchase-form__buttons">
					<Button
						variant="primary"
						isBusy={ cancellationInProgress }
						disabled={ disabled }
						onClick={ handleSubmit }
					>
						{ translate( 'Submit' ) }
					</Button>
				</div>
			</div>
		);
	};

	const renderHelpMessage = () => {
		if ( ! selectedReasonData?.helpMessage ) {
			return null;
		}

		return (
			<div className="cancel-purchase-form__feedback-question">
				<div className="cancel-purchase-form__notice">
					{ selectedReasonData.helpMessage }
					{ selectedReasonData.showLink && (
						<>
							<br />
							<a
								href={ localizeUrl( selectedReasonData.linkUrl! ) }
								target="_blank"
								rel="noopener noreferrer"
							>
								{ selectedReasonData.linkText }
							</a>
						</>
					) }
				</div>
			</div>
		);
	};

	const domainName = getName( purchase );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<BlankCanvas className="cancel-purchase-form">
			<BlankCanvas.Header onBackClick={ handleCloseDialog }>
				<span className="cancel-purchase-form__site-slug">
					{ translate( 'Cancel domain: %(domainName)s', { args: { domainName } } ) }
				</span>
			</BlankCanvas.Header>
			<BlankCanvas.Content>
				<div className="cancel-purchase-form__feedback">
					<FormattedHeader
						brandFont
						headerText={ translate( 'Share your feedback' ) }
						subHeaderText={ translate(
							'Before you go, please answer a few quick questions to help us improve WordPress.com.'
						) }
					/>
					<div className="cancel-purchase-form__feedback-questions">
						<div className="cancel-purchase-form__feedback-question">
							<SelectControl
								label={ String( translate( 'Why would you like to cancel?' ) ) }
								value={ selectedReason }
								options={ [
									{ value: '', label: String( translate( 'Select your reason' ) ), disabled: true },
									...cancellationReasons.map( ( reason ) => ( {
										value: reason.value,
										label: String( reason.label ),
									} ) ),
								] }
								onChange={ setSelectedReason }
							/>
						</div>

						{ renderHelpMessage() }

						{ selectedReasonData?.showTextarea && (
							<div className="cancel-purchase-form__feedback-question">
								<TextareaControl
									label={ translate( 'Can you please specify?' ) }
									placeholder={ translate( 'Please tell us more' ) }
									value={ message }
									onChange={ setMessage }
								/>
							</div>
						) }
					</div>
				</div>
			</BlankCanvas.Content>
			<BlankCanvas.Footer>{ renderButtons() }</BlankCanvas.Footer>
		</BlankCanvas>
	);
};

export default DomainCancellationSurvey;
