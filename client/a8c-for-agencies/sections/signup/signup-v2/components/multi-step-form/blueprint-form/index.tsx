import { Button } from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import FormRadio from 'calypso/components/forms/form-radio';
import { preventWidows } from 'calypso/lib/formatting';
import { AgencyDetailsSignupPayload } from '../../../../types';
import useBlueprintFormValidation from './hooks/use-blueprint-form-validation';

type Props = {
	onContinue: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
	initialFormData: Partial< AgencyDetailsSignupPayload >;
	goBack: () => void;
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

const BlueprintForm: React.FC< Props > = ( { onContinue, initialFormData, goBack } ) => {
	const translate = useTranslate();
	const { validate, validationError, updateValidationError } = useBlueprintFormValidation();
	const [ formData, setFormData ] = useState< Partial< AgencyDetailsSignupPayload > >( {
		topPartneringGoal: initialFormData.topPartneringGoal || '',
		topYearlyGoal: initialFormData.topYearlyGoal || '',
	} );

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();
		const error = await validate( formData );
		if ( error ) {
			return;
		}

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
				error={ validationError.topPartneringGoal }
				isRequired
			>
				<div className="blueprint-form__radio-group">
					{ topGoalOptions.map( ( option ) => (
						<BlueprintFormRadio
							key={ `goal-option-${ option.value }` }
							label={ option.label }
							checked={ formData.topPartneringGoal === option.value }
							onChange={ () => {
								setFormData( { ...formData, topPartneringGoal: option.value } );
								updateValidationError( { topPartneringGoal: undefined } );
							} }
						/>
					) ) }
				</div>
			</FormField>

			<FormField
				label={ translate( 'What is the main goal you hope to achieve as an agency 2025' ) }
				error={ validationError.topYearlyGoal }
				isRequired
			>
				<div className="blueprint-form__radio-group">
					{ mainGoal2025Options.map( ( option ) => (
						<BlueprintFormRadio
							key={ `main-goal-2025-option-${ option.value }` }
							label={ option.label }
							checked={ formData.topYearlyGoal === option.value }
							onChange={ () => {
								setFormData( { ...formData, topYearlyGoal: option.value } );
								updateValidationError( { topYearlyGoal: undefined } );
							} }
						/>
					) ) }
				</div>
			</FormField>

			<FormFooter>
				<Button
					className="signup-multi-step-form__back-button"
					variant="tertiary"
					onClick={ goBack }
					icon={ arrowLeft }
					iconSize={ 18 }
				>
					{ translate( 'Back' ) }
				</Button>

				<Button variant="primary" onClick={ handleSubmit } __next40pxDefaultSize>
					{ translate( 'Continue' ) }
				</Button>
			</FormFooter>
		</Form>
	);
};

export default BlueprintForm;
