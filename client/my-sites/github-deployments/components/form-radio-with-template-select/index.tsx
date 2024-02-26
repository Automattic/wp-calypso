import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import { getRepositoryTemplate, RepositoryTemplate } from './templates';

import './style.scss';

export type ProjectType = 'theme' | 'plugin' | 'site';

type FormRadioWithTemplateSelectProps = {
	isChecked?: boolean;
	label: string;
	projectType: ProjectType;
	onTemplateSelected: ( template: RepositoryTemplate ) => void;
	template: RepositoryTemplate;
	rest?: [ string, string ];
} & React.HTMLProps< HTMLDivElement >;

export const FormRadioWithTemplateSelect = ( {
	isChecked = false,
	label,
	projectType,
	onTemplateSelected,
	template,
}: FormRadioWithTemplateSelectProps ) => {
	const { __ } = useI18n();
	const templates = useMemo( () => getRepositoryTemplate( projectType ), [ projectType ] );

	const handleTemplateChange = ( event: React.ChangeEvent< HTMLSelectElement > ) => {
		const selectedValue = event.currentTarget.value;
		const selectedTemplate = templates?.find(
			( template ) => template.repositoryName === selectedValue
		);

		if ( selectedTemplate ) {
			onTemplateSelected( selectedTemplate );
		}
	};

	return (
		<label
			className={ classNames( 'form-radio-with-template-select', {
				checked: isChecked,
			} ) }
			htmlFor={ label }
		>
			<div>
				<FormRadio
					id={ label }
					checked={ isChecked }
					label={ label }
					onChange={ () => {
						onTemplateSelected( templates[ 0 ] );
					} }
					className="form-radio-bar"
				/>
			</div>
			{ isChecked && (
				<div>
					<FormSelect onChange={ handleTemplateChange } value={ template.repositoryName }>
						{ templates.map( ( template ) => (
							<option key={ template.repositoryName } value={ template.repositoryName }>
								{ template.name }
							</option>
						) ) }
					</FormSelect>
					{ template && (
						<small style={ { marginTop: '12px' } }>
							{ createInterpolateElement( __( 'Learn more about the <link/> template' ), {
								link: <ExternalLink href={ template.link }>{ template.name }</ExternalLink>,
							} ) }
						</small>
					) }
				</div>
			) }
		</label>
	);
};
