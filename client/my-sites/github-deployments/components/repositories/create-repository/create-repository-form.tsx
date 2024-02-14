import { FormLabel, SelectDropdown } from '@automattic/components';
import { Button, FormToggle } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { FormRadioWithTemplateSelect } from './form-radio-with-template-select';
import './style.scss';

type CreateRepositoryFormProps = {
	onRepositoryCreated?: () => void;
};

export const CreateRepositoryForm = ( { onRepositoryCreated }: CreateRepositoryFormProps ) => {
	const { __ } = useI18n();

	const [ selected, setSelected ] = useState( '' );

	const handleCreateRepository = () => {
		onRepositoryCreated?.();
	};

	return (
		<div className="github-deployments-create-repository">
			<form style={ { width: '100%', flex: 1 } }>
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
					<FormLabel htmlFor="deploy">{ __( 'Privacy' ) }</FormLabel>
					<div className="deploy-toggle">
						<FormToggle id="deploy" checked={ false } onChange={ () => {} } />
						<p style={ { margin: '0', marginLeft: '8px' } }>
							{ __( 'Create private repository' ) }
						</p>
					</div>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ __( 'What are you building ' ) }</FormLabel>
					<FormRadioWithTemplateSelect
						label={ __( 'A theme' ) }
						projectType="theme"
						isChecked={ selected === 'theme' }
						onChange={ () => {
							setSelected( 'theme' );
						} }
						onTemplateSelected={ () => {} }
					/>
					<FormRadioWithTemplateSelect
						style={ { marginTop: '8px' } }
						label={ __( 'A plugin' ) }
						projectType="plugin"
						isChecked={ selected === 'plugin' }
						onChange={ () => {
							setSelected( 'plugin' );
						} }
						onTemplateSelected={ () => {} }
					/>
					<FormRadioWithTemplateSelect
						style={ { marginTop: '8px' } }
						label={ __( 'A site' ) }
						projectType="site"
						isChecked={ selected === 'site' }
						onChange={ () => {
							setSelected( 'site' );
						} }
						onTemplateSelected={ () => {} }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="directory">{ __( 'Destination directory' ) }</FormLabel>
					<FormTextInput id="directory" placeholder="/" />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="deploy">{ __( 'Automatic deploys' ) }</FormLabel>
					<div className="deploy-toggle">
						<FormToggle id="deploy" checked={ true } onChange={ () => {} } />
						<p style={ { margin: '0', marginLeft: '8px' } }>{ __( 'Deploy changes on push ' ) }</p>
					</div>
				</FormFieldset>
				<Button variant="primary" onClick={ handleCreateRepository }>
					{ __( 'Create repository' ) }
				</Button>
			</form>
			<div className="deployment-style">
				<h3 style={ { fontSize: '16px', marginBottom: '16px' } }>
					{ __( 'Pick your deployment style' ) }
				</h3>
				<FormRadiosBar
					items={ [
						{ label: __( 'Simple' ), value: 'simple' },
						{ label: __( 'Customizable' ), value: 'custom' },
					] }
					checked="simple"
					onChange={ () => {} }
					disabled={ false }
				/>
			</div>
		</div>
	);
};
