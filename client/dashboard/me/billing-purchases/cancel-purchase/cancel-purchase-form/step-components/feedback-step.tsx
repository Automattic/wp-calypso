import { RadioControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Notice } from '../../../../../components/notice';
import { getCancellationReasons } from '../cancellation-reasons';
import { toSelectOption } from '../to-select-options';
import type { PlanProduct, Purchase } from '@automattic/api-core';

type ChangeCallback = ( value: string ) => void;
type DetailsChangeCallback = ( value: string, details?: string ) => void;

type CancellationReasonProps = {
	purchase: Purchase;
	reasonCodes: string[];
	onChange: ChangeCallback;
	plans: PlanProduct[];
	onDetailsChange: DetailsChangeCallback;
};

function CancellationReason( {
	purchase,
	reasonCodes,
	onChange,
	plans,
	...props
}: CancellationReasonProps ) {
	const [ value, setValue ] = useState( '' );
	const [ details, setDetails ] = useState( '' );
	const [ feedbackValue, setFeedbackValue ] = useState( '' );
	const reasons = getCancellationReasons( reasonCodes );
	const selectedReason = reasons.find( ( reason ) => reason.value === value );
	const selectedSubOption = selectedReason?.selectOptions?.find(
		( option ) => option.value === details
	);

	const onDetailsChange = ( val: string ) => {
		setDetails( val );
		setFeedbackValue( '' );
		props.onDetailsChange( val );
	};

	const onTextAreaChange = ( val: string ) => {
		setFeedbackValue( val );
		props.onDetailsChange( val, details );
	};

	const renderHelpMessage = () => {
		if ( ! selectedReason || ! selectedReason?.helpMessage ) {
			return null;
		}

		return (
			<p>
				<Notice variant="warning">
					<span>{ selectedReason.helpMessage }</span>
				</Notice>
			</p>
		);
	};

	return (
		<>
			<div className="cancel-purchase-form__feedback-question">
				<RadioControl
					label={ __( 'Why would you like to cancel?' ) }
					selected={ value }
					options={ reasons.map( toSelectOption ) }
					onChange={ ( val ) => {
						onDetailsChange( '' );
						setValue( val );
						onChange( val );
					} }
				/>
			</div>

			{ renderHelpMessage() }

			{ selectedReason?.textPlaceholder && (
				<div className="cancel-purchase-form__feedback-question">
					<TextareaControl
						label={ __( 'Can you please specify?' ) }
						placeholder={ String( selectedReason.textPlaceholder ) }
						value={ details }
						onChange={ onDetailsChange }
					/>
				</div>
			) }
			{ ! selectedReason?.textPlaceholder && selectedReason?.selectOptions && (
				<div className="cancel-purchase-form__feedback-question">
					<RadioControl
						label={ __( 'Why is that?' ) }
						selected={ details }
						options={ selectedReason.selectOptions.map( toSelectOption ) }
						onChange={ onDetailsChange }
					/>
				</div>
			) }
			{ selectedSubOption?.textPlaceholder && (
				<div className="cancel-purchase-form__feedback-question">
					<TextareaControl
						label={ __( 'Can you please specify?' ) }
						placeholder={ String( selectedSubOption.textPlaceholder ) }
						value={ feedbackValue }
						onChange={ onTextAreaChange }
					/>
				</div>
			) }
		</>
	);
}

function ImportQuestion( { onChange }: { onChange?: ChangeCallback } ) {
	const [ value, setValue ] = useState( '' );
	const answers = [
		{
			value: 'happy',
			label: __( 'I was happy.' ),
		},
		{
			value: 'look',
			label: __(
				'Most of my content was imported, but it was too hard to get things looking right.'
			),
		},
		{
			value: 'content',
			label: __( 'Not enough of my content was imported.' ),
		},
		{
			value: 'functionality',
			label: __( "I didn't have the functionality I have on my existing site." ),
		},
	];
	const options = answers.map( ( answer ) => ( { ...answer, disabled: ! answer.value } ) );

	return (
		<div className="cancel-purchase-form__feedback-question">
			<RadioControl
				label={ __( 'You imported from another site. How did the import go?' ) }
				selected={ value }
				options={ options }
				onChange={ ( value ) => {
					setValue( value );
					onChange?.( value );
				} }
			/>
		</div>
	);
}

type FeedbackStepProps = {
	purchase: Purchase;
	plans: PlanProduct[];
	isImport: boolean;
	cancellationReasonCodes: string[];
	onChangeCancellationReason: ChangeCallback;
	onChangeCancellationReasonDetails: ChangeCallback;
	onChangeImportFeedback: ChangeCallback;
};

export default function FeedbackStep( {
	purchase,
	plans,
	isImport,
	cancellationReasonCodes,
	onChangeCancellationReason,
	onChangeCancellationReasonDetails,
	onChangeImportFeedback,
}: FeedbackStepProps ) {
	const isPlanPurchase = purchase.is_plan;
	const isGSuite = purchase.is_google_workspace_product;
	const isDomain = purchase.is_domain_registration;
	const showCancellationReason = isPlanPurchase || isGSuite || isDomain;

	return (
		<>
			{ showCancellationReason && (
				<CancellationReason
					plans={ plans }
					purchase={ purchase }
					reasonCodes={ cancellationReasonCodes ?? [] }
					onChange={ onChangeCancellationReason }
					onDetailsChange={ onChangeCancellationReasonDetails }
				/>
			) }
			{ showCancellationReason && isImport && (
				<ImportQuestion onChange={ onChangeImportFeedback } />
			) }
		</>
	);
}
