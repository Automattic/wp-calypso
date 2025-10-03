import { Button } from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
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
import useBlueprintForm2Validation from './hooks/use-blueprint-form-2-validation';

type Props = {
	onContinue: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
	initialFormData: Partial< AgencyDetailsSignupPayload >;
	goBack: () => void;
};

const BlueprintFormRadio = ( {
	id,
	label,
	checked,
	onChange,
}: {
	id?: string;
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
			<FormRadio
				id={ id }
				htmlFor={ id }
				label={ label }
				checked={ checked }
				onChange={ onChange }
			/>
		</div>
	);
};

const BlueprintForm2: React.FC< Props > = ( { onContinue, initialFormData, goBack } ) => {
	const translate = useTranslate();
	const [ formData, setFormData ] = useState< Partial< AgencyDetailsSignupPayload > >( {
		workWithClients: initialFormData.workWithClients || '',
		workWithClientsOther: initialFormData.workWithClientsOther || '',
		approachAndChallenges: initialFormData.approachAndChallenges || '',
	} );

	const { validate, validationError, updateValidationError } = useBlueprintForm2Validation();

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();
		const error = await validate( formData );
		if ( error ) {
			return;
		}

		onContinue( formData );
	};

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
		>
			<div className="field-mandatory-message">
				{ translate( 'Fields marked with * are required' ) }
			</div>
			<FormField
				label={ translate(
					"How does your agency typically work with clients regarding Automattic's solutions?"
				) }
				error={ validationError.workWithClients }
				isRequired
			>
				<div className="blueprint-form__radio-group">
					{ workModelOptions.map( ( option ) => (
						<BlueprintFormRadio
							key={ `work-model-option-${ option.value }` }
							id={ `work-model-option-${ option.value }` }
							label={ option.label }
							checked={ formData.workWithClients === option.value }
							onChange={ () => {
								setFormData( { ...formData, workWithClients: option.value } );
								updateValidationError( { workWithClients: undefined } );
							} }
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
					"Is there anything specific about your agency's approach or any challenges you face that you would like us to consider when creating your blueprint?"
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
					{ translate( 'Finish' ) }
				</Button>
			</FormFooter>
		</Form>
	);
};

export default BlueprintForm2;
