import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { preventWidows } from 'calypso/lib/formatting';

type Props = {
	onContinue: () => void;
};

type FormData = {
	topGoal: string;
	mainGoal2025: string;
	workModel: string;
	specificApproach: string;
};

const BlueprintForm: React.FC< Props > = ( { onContinue } ) => {
	const translate = useTranslate();
	const [ formData, setFormData ] = useState< FormData >( {
		topGoal: '',
		mainGoal2025: '',
		workModel: '',
		specificApproach: '',
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onContinue();
	};

	return (
		<Form
			className="blueprint-form"
			title={ preventWidows( translate( "Let's build your blueprint" ) ) }
			description={ translate(
				"We'll send you a custom blueprint to grow your business based on your answers below."
			) }
		>
			<div className="blueprint-form__fields">
				<FormField
					label={ translate( 'What is your top goal when partnering with a technology provider?' ) }
					isRequired
				>
					<div className="blueprint-form__radio-group">
						<FormRadio
							label={ translate( 'Access to cutting-edge technology' ) }
							checked={ formData.topGoal === 'cutting_edge_tech' }
							onChange={ () => setFormData( { ...formData, topGoal: 'cutting_edge_tech' } ) }
						/>
						<FormRadio
							label={ translate( 'Comprehensive support and troubleshooting' ) }
							checked={ formData.topGoal === 'comprehensive_support' }
							onChange={ () => setFormData( { ...formData, topGoal: 'comprehensive_support' } ) }
						/>
						<FormRadio
							label={ translate( 'Lead generation and new business opportunities' ) }
							checked={ formData.topGoal === 'lead_generation' }
							onChange={ () => setFormData( { ...formData, topGoal: 'lead_generation' } ) }
						/>
						<FormRadio
							label={ translate( 'Training and education for your team' ) }
							checked={ formData.topGoal === 'training_education' }
							onChange={ () => setFormData( { ...formData, topGoal: 'training_education' } ) }
						/>
						<FormRadio
							label={ translate( 'Exclusive discounts or revenue-sharing options' ) }
							checked={ formData.topGoal === 'exclusive_discounts' }
							onChange={ () => setFormData( { ...formData, topGoal: 'exclusive_discounts' } ) }
						/>
					</div>
				</FormField>

				<FormField
					label={ translate( 'What is the main goal you hope to achieve in 2025?' ) }
					isRequired
				>
					<div className="blueprint-form__radio-group">
						<FormRadio
							label={ translate( 'Scaling the agency significantly' ) }
							checked={ formData.mainGoal2025 === 'scaling_agency' }
							onChange={ () => setFormData( { ...formData, mainGoal2025: 'scaling_agency' } ) }
						/>
						<FormRadio
							label={ translate( 'Diversifying offered services' ) }
							checked={ formData.mainGoal2025 === 'diversifying_services' }
							onChange={ () =>
								setFormData( { ...formData, mainGoal2025: 'diversifying_services' } )
							}
						/>
						<FormRadio
							label={ translate( 'Increasing the number of long-term clients' ) }
							checked={ formData.mainGoal2025 === 'increasing_clients' }
							onChange={ () => setFormData( { ...formData, mainGoal2025: 'increasing_clients' } ) }
						/>
						<FormRadio
							label={ translate( 'Expanding into new markets or territories' ) }
							checked={ formData.mainGoal2025 === 'expanding_markets' }
							onChange={ () => setFormData( { ...formData, mainGoal2025: 'expanding_markets' } ) }
						/>
						<FormRadio
							label={ translate( "Strengthening the agency's brand and reputation" ) }
							checked={ formData.mainGoal2025 === 'strengthening_brand' }
							onChange={ () => setFormData( { ...formData, mainGoal2025: 'strengthening_brand' } ) }
						/>
					</div>
				</FormField>

				<FormField
					label={ translate(
						"How does your agency typically work with clients regarding Automattic's solutions?"
					) }
					isRequired
				>
					<div className="blueprint-form__radio-group">
						<FormRadio
							label={ translate(
								'We refer customers to Automattic products/services to purchase on their own'
							) }
							checked={ formData.workModel === 'refer_customers' }
							onChange={ () => setFormData( { ...formData, workModel: 'refer_customers' } ) }
						/>
						<FormRadio
							label={ translate(
								"We purchase on our clients' behalf and resell Automattic products/services"
							) }
							checked={ formData.workModel === 'purchase_resell' }
							onChange={ () => setFormData( { ...formData, workModel: 'purchase_resell' } ) }
						/>
						<FormRadio
							label={ translate( 'A combination of referring and reselling' ) }
							checked={ formData.workModel === 'combination' }
							onChange={ () => setFormData( { ...formData, workModel: 'combination' } ) }
						/>
						<FormRadio
							label={ translate( 'Other models (please explain)' ) }
							checked={ formData.workModel === 'other' }
							onChange={ () => setFormData( { ...formData, workModel: 'other' } ) }
						/>
						{ formData.workModel === 'other' && (
							<FormTextarea
								value={ formData.specificApproach }
								onChange={ () => {
									// TODO: form data
									return;
								} }
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
						value={ formData.specificApproach }
						onChange={ ( e: React.ChangeEvent< HTMLTextAreaElement > ) =>
							setFormData( { ...formData, specificApproach: e.target.value } )
						}
						placeholder={ translate( 'Add your approach' ) }
					/>
				</FormField>

				<div className="blueprint-form__controls">
					<Button variant="primary" onClick={ handleSubmit } className="blueprint-form__submit">
						{ translate( 'Continue' ) }
					</Button>
				</div>
			</div>
		</Form>
	);
};

export default BlueprintForm;
