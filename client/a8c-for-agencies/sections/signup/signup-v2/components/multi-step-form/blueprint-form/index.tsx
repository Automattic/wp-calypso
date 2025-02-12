import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { preventWidows } from 'calypso/lib/formatting';
import { AgencyDetailsSignupPayload } from '../../../../types';

import './style.scss';

type Props = {
	onContinue: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
};

const BlueprintFormRadio = ( {
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: () => void;
} ) => {
	return (
		<div
			className="blue-print-form__radio"
			onClick={ onChange }
			role="button"
			tabIndex={ 0 }
			onKeyDown={ ( e ) => {
				if ( e.key === 'Enter' ) {
					onChange();
				}
			} }
		>
			<FormRadio label={ label } checked={ checked } onChange={ onChange } />
		</div>
	);
};

const BlueprintForm: React.FC< Props > = ( { onContinue } ) => {
	const translate = useTranslate();
	const [ formData, setFormData ] = useState< Partial< AgencyDetailsSignupPayload > >( {
		topPartneringGoal: '',
		topYearlyGoal: '',
		workWithClients: '',
		workWithClientsOther: '',
		approachAndChallenges: '',
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onContinue( formData );
	};

	const topGoalOptions = [
		{ label: translate( 'Access to cutting-edge technology' ), value: 'cutting_edge_tech' },
		{
			label: translate( 'Comprehensive support and troubleshooting' ),
			value: 'comprehensive_support',
		},
		{
			label: translate( 'Lead generation and new business opportunities' ),
			value: 'lead_generation',
		},
		{ label: translate( 'Training and education for your team' ), value: 'training_education' },
		{
			label: translate( 'Exclusive discounts or revenue-sharing options' ),
			value: 'exclusive_discounts',
		},
	];

	const mainGoal2025Options = [
		{ label: translate( 'Scaling the agency significantly' ), value: 'scaling_agency' },
		{ label: translate( 'Diversifying offered services' ), value: 'diversifying_services' },
		{
			label: translate( 'Increasing the number of long-term clients' ),
			value: 'increasing_clients',
		},
		{ label: translate( 'Expanding into new markets or territories' ), value: 'expanding_markets' },
		{
			label: translate( "Strengthening the agency's brand and reputation" ),
			value: 'strengthening_brand',
		},
	];

	const workModelOptions = [
		{
			label: translate(
				'Refer customers to Automattic products/services to purchase on their own'
			),
			value: 'refer_customers',
		},
		{
			label: translate( "Purchase on our clients' behalf and resell Automattic products/services" ),
			value: 'purchase_resell',
		},
		{ label: translate( 'A combination of referring and reselling' ), value: 'combination' },
		{ label: translate( 'Other models (please explain)' ), value: 'other' },
	];

	return (
		<Form
			className="blueprint-form"
			title={ preventWidows( translate( "Let's build your blueprint" ) ) }
			description={ translate(
				"We'll send you a custom blueprint to grow your business based on your answers below."
			) }
		>
			<FormField
				label={ translate( 'What is your top goal when partnering with a technology provider?' ) }
				isRequired
			>
				<div className="blueprint-form__radio-group">
					{ topGoalOptions.map( ( option ) => (
						<BlueprintFormRadio
							key={ `goal-option-${ option.value }` }
							label={ option.label }
							checked={ formData.topPartneringGoal === option.value }
							onChange={ () => setFormData( { ...formData, topPartneringGoal: option.value } ) }
						/>
					) ) }
				</div>
			</FormField>

			<FormField
				label={ translate( 'What is the main goal you hope to achieve in 2025?' ) }
				isRequired
			>
				<div className="blueprint-form__radio-group">
					{ mainGoal2025Options.map( ( option ) => (
						<BlueprintFormRadio
							key={ `main-goal-2025-option-${ option.value }` }
							label={ option.label }
							checked={ formData.topYearlyGoal === option.value }
							onChange={ () => setFormData( { ...formData, topYearlyGoal: option.value } ) }
						/>
					) ) }
				</div>
			</FormField>

			<FormField
				label={ translate(
					"How does your agency typically work with clients regarding Automattic's solutions?"
				) }
				isRequired
			>
				<div className="blueprint-form__radio-group">
					{ workModelOptions.map( ( option ) => (
						<BlueprintFormRadio
							key={ `work-model-option-${ option.value }` }
							label={ option.label }
							checked={ formData.workWithClients === option.value }
							onChange={ () => setFormData( { ...formData, workWithClients: option.value } ) }
						/>
					) ) }
					{ formData.workWithClients === 'other' && (
						<FormTextInput
							value={ formData.workWithClientsOther }
							onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
								setFormData( { ...formData, workWithClientsOther: e.target.value } )
							}
							placeholder={ translate( 'Add your explanation' ) }
						/>
					) }
				</div>
			</FormField>

			<FormField
				label={ translate(
					`Is there anything specific about your agency's approach or any challenges you face that you would like us to consider when creating your blueprint?`
				) }
			>
				<FormTextarea
					value={ formData.approachAndChallenges }
					onChange={ ( e: React.ChangeEvent< HTMLTextAreaElement > ) =>
						setFormData( { ...formData, approachAndChallenges: e.target.value } )
					}
					placeholder={ translate( 'Add your approach' ) }
				/>
			</FormField>

			<FormFooter>
				<Button variant="primary" onClick={ handleSubmit } __next40pxDefaultSize>
					{ translate( 'Continue' ) }
				</Button>
			</FormFooter>
		</Form>
	);
};

export default BlueprintForm;
