import { FormLabel, SelectDropdown } from '@automattic/components';
import { Button, FormToggle } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { getRepositoryTemplate } from './templates';
import './style.scss';

type CreateRepositoryFormProps = {
	onRepositoryCreated?: () => void;
};

type ProjectType = 'theme' | 'plugin' | 'site';

export const CreateRepositoryForm = ( { onRepositoryCreated }: CreateRepositoryFormProps ) => {
	const { __ } = useI18n();
	const [ checked, setChecked ] = useState< ProjectType >( 'theme' );
	const [ selectedTemplate, setSelectedTemplate ] = useState(
		getRepositoryTemplate( checked )[ 0 ]
	);

	const handleCreateRepository = () => {
		onRepositoryCreated?.();
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
		<form style={ { width: '100%' } }>
			<div className="repository-name-formfieldset">
				<FormFieldset style={ { flex: 0.5 } }>
					<FormLabel htmlFor="githubAccount">{ __( 'Github account' ) }</FormLabel>
					<SelectDropdown
						id="githubAccount"
						options={ [
							{ label: 'Account 1', value: 'account1' },
							{ label: 'Account 2', value: 'account2' },
						] }
					/>
				</FormFieldset>
				<FormFieldset style={ { flex: 1 } }>
					<FormLabel htmlFor="repoName">{ __( 'Repository name' ) }</FormLabel>
					<FormTextInput id="repoName" placeholder="my-amazing-project" />
				</FormFieldset>
			</div>
			<FormFieldset>
				<FormLabel>{ __( 'What are you building ' ) }</FormLabel>
				<FormFieldset>
					<FormRadio label={ __( 'A theme' ) } onChange={ () => {} } className={ undefined } />
					<div>
						<FormSelect onChange={ handleTemplateChange } value={ selectedTemplate.value }>
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
					</div>
				</FormFieldset>
				{ /* <FormRadiosBar
					items={ [
						{ label: __( 'A theme' ), value: 'theme' },
						{ label: __( 'A plugin' ), value: 'plugin' },
						{ label: __( 'An entire site' ), value: 'site' },
					] }
					checked={ checked }
					onChange={ handleCheckedChange }
					disabled={ false }
				/> */ }
			</FormFieldset>
			<FormFieldset>
				<FormLabel htmlFor="directory">{ __( 'Destination directory' ) }</FormLabel>
				<FormTextInput id="directory" placeholder="/" />
			</FormFieldset>
			<FormFieldset>
				<FormLabel htmlFor="deploy">{ __( 'Automatic deploys' ) }</FormLabel>
				<div className="deploy-toggle">
					<FormToggle id="deploy" checked={ true } onChange={ () => {} } />
					<small style={ { marginLeft: '8px' } }>{ __( 'Deploy changes on push ' ) }</small>
				</div>
			</FormFieldset>
			<Button variant="primary" onClick={ handleCreateRepository }>
				{ __( 'Create repository' ) }
			</Button>
		</form>
	);
};
