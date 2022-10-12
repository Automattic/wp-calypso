import { isPlan } from '@automattic/calypso-products';
import { SelectControl, TextareaControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { getCancellationReasons } from '../cancellation-reasons';
import { toSelectOption } from '../to-select-options';
import type { Purchase } from 'calypso/lib/purchases/types';

type ChangeCallback = ( value: string ) => void;

type CancellationReasonProps = {
	purchase: Purchase;
	reasonCodes: string[];
	onChange: ChangeCallback;
	onDetailsChange: ChangeCallback;
};

function CancellationReason( { purchase, reasonCodes, ...props }: CancellationReasonProps ) {
	const translate = useTranslate();
	const [ value, setValue ] = useState( '' );
	const [ details, setDetails ] = useState( '' );
	const reasons = getCancellationReasons( reasonCodes, { productSlug: purchase.productSlug } );
	const selectedReason = reasons.find( ( reason ) => reason.value === value );

	const onDetailsChange = ( val: string ) => {
		setDetails( val );
		props.onDetailsChange( val );
	};

	return (
		<>
			<div className="cancel-purchase-form__feedback-question">
				<SelectControl
					label={ translate( 'Why would you like to cancel?' ) }
					value={ value }
					options={ reasons.map( toSelectOption ) }
					onChange={ ( val ) => {
						onDetailsChange( '' );
						setValue( val );
						props.onChange( val );
					} }
				/>
			</div>
			{ selectedReason?.textPlaceholder && (
				<div className="cancel-purchase-form__feedback-question">
					<TextareaControl
						label={ translate( 'Can you please specify?' ) }
						placeholder={ String( selectedReason.textPlaceholder ) }
						value={ details }
						onChange={ onDetailsChange }
					/>
				</div>
			) }
			{ ! selectedReason?.textPlaceholder && selectedReason?.selectOptions && (
				<div className="cancel-purchase-form__feedback-question">
					<SelectControl
						label={ translate( 'Why is that?' ) }
						value={ details }
						options={ selectedReason.selectOptions.map( toSelectOption ) }
						onChange={ onDetailsChange }
					/>
				</div>
			) }
		</>
	);
}

function ImportQuestion( { onChange }: { onChange?: ChangeCallback } ) {
	const translate = useTranslate();
	const [ value, setValue ] = useState( '' );
	const answers = [
		// placeholder {{
		{
			value: '',
			label: translate( 'Select an answer' ),
		},
		// }} placeholder
		{
			value: 'happy',
			label: translate( 'I was happy.' ),
		},
		{
			value: 'look',
			label: translate(
				'Most of my content was imported, but it was too hard to get things looking right.'
			),
		},
		{
			value: 'content',
			label: translate( 'Not enough of my content was imported.' ),
		},
		{
			value: 'functionality',
			label: translate( "I didn't have the functionality I have on my existing site." ),
		},
	];
	const options = answers.map( ( answer ) => ( { ...answer, disabled: ! answer.value } ) );

	return (
		<div className="cancel-purchase-form__feedback-question">
			<SelectControl
				label={ translate( 'You imported from another site. How did the import go?' ) }
				value={ value }
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
	isImport: boolean;
	cancellationReasonCodes: string[];
	onChangeCancellationReason: ChangeCallback;
	onChangeCancellationReasonDetails: ChangeCallback;
	onChangeImportFeedback?: ChangeCallback;
};

export default function FeedbackStep( { purchase, isImport, ...props }: FeedbackStepProps ) {
	const translate = useTranslate();
	const productName = translate( 'WordPress.com' );
	const isPlanPurchase = isPlan( purchase );

	return (
		<div className="cancel-purchase-form__feedback">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Share your feedback' ) }
				subHeaderText={ translate(
					'Before you go, please answer a few quick questions to help us improve %(productName)s.',
					{
						args: { productName },
					}
				) }
			/>
			<div className="cancel-purchase-form__feedback-questions">
				{ isPlanPurchase && (
					<CancellationReason
						purchase={ purchase }
						reasonCodes={ props.cancellationReasonCodes }
						onChange={ props.onChangeCancellationReason }
						onDetailsChange={ props.onChangeCancellationReasonDetails }
					/>
				) }
				{ isPlanPurchase && isImport && <ImportQuestion /> }
			</div>
		</div>
	);
}
