import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement, useEffect, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import { getRepositoryTemplate } from './templates';

import './style.scss';

export type ProjectType = 'theme' | 'plugin' | 'site';

type FormRadioWithTemplateSelectProps = {
	isChecked?: boolean;
	label: string;
	projectType: ProjectType;
	onChange?: () => void;
	onTemplateSelected: ( template: RepositoryTemplate ) => void;
	template: RepositoryTemplate;
	rest?: [ string, string ];
} & React.HTMLProps< HTMLDivElement >;

export type RepositoryTemplate = {
	name: string;
	value: string;
	link: string;
};

export const FormRadioWithTemplateSelect = ( {
	isChecked = false,
	label,
	projectType,
	onTemplateSelected,
	onChange,
	template,
}: FormRadioWithTemplateSelectProps ) => {
	const { __ } = useI18n();

	const [ checked, setChecked ] = useState< boolean >( isChecked );
	const [ selectedTemplate, setSelectedTemplate ] = useState< RepositoryTemplate >( template );

	useEffect( () => {
		setChecked( isChecked );
	}, [ isChecked ] );

	const handleTemplateChange = ( event: React.ChangeEvent< HTMLSelectElement > ) => {
		const selectedValue = event.currentTarget.value;
		const templates = getRepositoryTemplate( projectType );
		const selectedTemplate = templates?.find(
			( template: { value: string } ) => template.value === selectedValue
		);
		if ( selectedTemplate ) {
			setSelectedTemplate( selectedTemplate );
			onTemplateSelected( selectedTemplate );
		}
	};

	return (
		<label
			className={ classNames( 'form-radio-with-template-select', {
				checked: checked,
			} ) }
			htmlFor={ label }
		>
			<div>
				<FormRadio
					id={ label }
					checked={ checked }
					label={ label }
					onChange={ () => {
						setChecked( ! checked );
						onChange?.();
					} }
					className="form-radio-bar"
				/>
			</div>
			{ checked && (
				<div>
					<FormSelect
						onChange={ handleTemplateChange }
						value={ selectedTemplate?.value ?? 'Select template' }
					>
						<option value="Select template" disabled>
							{ __( 'Select template' ) }
						</option>
						{ getRepositoryTemplate( projectType ).map( ( template ) => (
							<option key={ template.value } value={ template.value }>
								{ template.name }
							</option>
						) ) }
					</FormSelect>
					{ selectedTemplate && (
						<small style={ { marginTop: '12px' } }>
							{ createInterpolateElement( __( 'Learn more about the <link/> template' ), {
								link: (
									<ExternalLink href={ selectedTemplate?.link }>
										{ selectedTemplate?.name }
									</ExternalLink>
								),
							} ) }
						</small>
					) }
				</div>
			) }
		</label>
	);
};
