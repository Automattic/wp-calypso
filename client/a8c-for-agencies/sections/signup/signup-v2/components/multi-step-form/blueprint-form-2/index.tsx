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

const BlueprintForm2: React.FC< Props > = ( { onContinue } ) => {
	const translate = useTranslate();
	const [ formData, setFormData ] = useState< Partial< AgencyDetailsSignupPayload > >( {
		workWithClients: '',
		workWithClientsOther: '',
		approachAndChallenges: '',
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
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

export default BlueprintForm2;
