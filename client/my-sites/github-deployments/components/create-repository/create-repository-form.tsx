import { FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { getRepositoryTemplate } from './templates';
import './style.scss';

type CreateRepositoryFormProps = {
	onRepositoryCreated?: () => void;
	className?: string;
	onCancel?: () => void;
};

type ProjectType = 'theme' | 'plugin' | 'site';

export const CreateRepositoryForm = ( {
	onRepositoryCreated,
	className,
	onCancel,
}: CreateRepositoryFormProps ) => {
	const { __ } = useI18n();
	const [ checked, setChecked ] = useState< ProjectType >( 'theme' );
	const [ selectedTemplate, setSelectedTemplate ] = useState(
		getRepositoryTemplate( checked )[ 0 ]
	);

	const handleCreateRepository = () => {
		onRepositoryCreated?.();
	};

	const handleCancel = () => {
		onCancel?.();
	};

	const handleTemplateChange = ( event: React.ChangeEvent< HTMLSelectElement > ) => {
		const selectedValue = event.currentTarget.value;
		const templates = getRepositoryTemplate( checked );
		const selectedTemplate = templates.find( ( template ) => template.value === selectedValue );

		setSelectedTemplate( selectedTemplate || templates[ 0 ] );
	};

	const handleCheckedChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newCheckedValue = event.currentTarget.value as ProjectType;
		setChecked( newCheckedValue );

		const templates = getRepositoryTemplate( newCheckedValue );
		setSelectedTemplate( templates[ 0 ] );
	};

	return (
		<form className={ classNames( 'github-deployments-create-repository', className ) }>
			<FormFieldset>
				<FormLabel htmlFor="projectName">{ __( 'Project Name' ) }</FormLabel>
				<FormTextInput id="projectName" />
			</FormFieldset>
			<FormFieldset>
				<FormLabel>{ __( 'What are you building ' ) }</FormLabel>
				<FormRadiosBar
					items={ [
						{ label: __( 'A theme' ), value: 'theme' },
						{ label: __( 'A plugin' ), value: 'plugin' },
						{ label: __( 'An entire site' ), value: 'site' },
					] }
					checked={ checked }
					onChange={ handleCheckedChange }
					disabled={ false }
				/>
			</FormFieldset>
			<FormFieldset>
				<FormLabel htmlFor="template">{ __( 'Select starter template' ) }</FormLabel>
				<FormSelect
					id="template"
					value={ selectedTemplate.value }
					onChange={ handleTemplateChange }
				>
					{ getRepositoryTemplate( checked ).map( ( template ) => (
						<option key={ template.value } value={ template.value }>
							{ template.name }
						</option>
					) ) }
				</FormSelect>
				<small style={ { marginTop: '12px' } }>
					{ createInterpolateElement(
						sprintf(
							/* translators: %s is the name of the template */
							__( 'Learn more about the <link>%s</link> template' ),
							selectedTemplate.name
						),
						{
							link: <InlineSupportLink supportContext="site-monitoring" showIcon={ false } />,
						}
					) }
				</small>
			</FormFieldset>
			<div className="action-buttons">
				<Button variant="primary" onClick={ handleCreateRepository }>
					{ __( 'Create repository' ) }
				</Button>
				<Button variant="tertiary" onClick={ handleCancel }>
					{ __( 'Cancel' ) }
				</Button>
			</div>
		</form>
	);
};
