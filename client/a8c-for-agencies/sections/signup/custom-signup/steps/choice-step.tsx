/**
 * PROTOTYPE — proof of concept only.
 *
 * Steps 3 and 4 of `/custom-signup`: a single multi-select question shown as
 * cards, ending with an "Other" option that expands into a text field.
 */
import { Button } from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import ChoiceCards from '../components/choice-cards';
import type { ChoiceOption } from '../lib/options';

export type ChoiceStepAnswer = {
	value: string[];
	otherText: string;
};

type Props = {
	title: string;
	description: string;
	options: ChoiceOption[];
	initialValue: string[];
	initialOtherText: string;
	otherPlaceholder?: string;
	ctaLabel: string;
	// Small text shown above the buttons.
	footerNote?: string;
	onContinue: ( answer: ChoiceStepAnswer ) => void;
	onBack: ( answer: ChoiceStepAnswer ) => void;
};

export default function ChoiceStep( {
	title,
	description,
	options,
	initialValue,
	initialOtherText,
	otherPlaceholder,
	ctaLabel,
	footerNote,
	onContinue,
	onBack,
}: Props ) {
	const translate = useTranslate();
	const [ value, setValue ] = useState< string[] >( initialValue );
	const [ otherText, setOtherText ] = useState( initialOtherText );

	const answer = (): ChoiceStepAnswer => ( {
		value,
		// Only keep the free text while "Other" is selected.
		otherText: value.includes( 'other' ) ? otherText : '',
	} );

	return (
		<Form className="a4a-custom-signup-step" title={ title } description={ description }>
			<ChoiceCards
				label={ title }
				options={ options }
				value={ value }
				onChange={ setValue }
				otherText={ otherText }
				onOtherTextChange={ setOtherText }
				otherPlaceholder={ otherPlaceholder }
			/>

			{ footerNote && <p className="a4a-custom-signup-step-note">{ footerNote }</p> }

			<FormFooter>
				<div className="a4a-custom-signup-step-actions">
					<Button
						className="a4a-custom-signup-back-button"
						variant="tertiary"
						icon={ arrowLeft }
						onClick={ () => onBack( answer() ) }
					>
						{ translate( 'Back' ) }
					</Button>
					<Button __next40pxDefaultSize variant="primary" onClick={ () => onContinue( answer() ) }>
						{ ctaLabel }
					</Button>
				</div>
			</FormFooter>
		</Form>
	);
}
