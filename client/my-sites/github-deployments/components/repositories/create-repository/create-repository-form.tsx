import { FormLabel } from '@automattic/components';
import { Button, FormToggle, Spinner } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { GitHubAccountsDropdown } from 'calypso/my-sites/github-deployments/components/accounts-dropdown/index';
import { useLiveAccounts } from 'calypso/my-sites/github-deployments/components/accounts-dropdown/use-live-accounts';
import {
	FormRadioWithTemplateSelect,
	ProjectType,
	RepositoryTemplate,
} from './form-radio-with-template-select';
import { repositoryTemplates } from './templates';
import { MutationVariables } from './use-create-code-deployment-and-repository';

import './style.scss';

type CreateRepositoryFormProps = {
	onRepositoryCreated( args: MutationVariables ): void;
	isPending?: boolean;
};

export const CreateRepositoryForm = ( {
	onRepositoryCreated,
	isPending,
}: CreateRepositoryFormProps ) => {
	const { __ } = useI18n();
	const {
		account,
		setAccount,
		accounts = [],
		onNewInstallationRequest,
		isLoadingAccounts,
	} = useLiveAccounts( {} );
	const [ repositoryName, setRepositoryName ] = useState( '' );
	const [ targetDir, setTargetDir ] = useState( '/' );
	const [ projectType, setProjectType ] = useState< ProjectType >( 'plugin' );
	const [ isPrivate, setIsPrivate ] = useState( true );
	const [ isAutomated, setIsAutomated ] = useState( false );
	const [ template, setTemplate ] = useState< RepositoryTemplate >(
		repositoryTemplates.plugin[ 0 ]
	);

	const isFormValid = repositoryName.trim() && ! isLoadingAccounts;

	const handleCreateRepository = () => {
		const repositoryAccount = account || accounts[ 0 ];
		onRepositoryCreated( {
			installationId: repositoryAccount.external_id,
			template: template.value,
			accountName: repositoryAccount.account_name,
			repositoryName,
			targetDir,
			isPrivate,
			isAutomated,
		} );
	};

	useEffect( () => {
		switch ( projectType ) {
			case 'plugin':
				setTargetDir( '/wp-content/plugins/' + repositoryName );
				break;
			case 'theme':
				setTargetDir( '/wp-content/themes/' + repositoryName );
				break;
			case 'site':
				setTargetDir( '/' );
				break;
		}
	}, [ projectType, repositoryName ] );

	return (
		<div className="github-deployments-create-repository">
			<form style={ { width: '100%', flex: 1 } }>
				<div className="repository-name-formfieldset">
					<FormFieldset style={ { flex: 0.5 } }>
						<FormLabel htmlFor="githubAccount">{ __( 'Github account' ) }</FormLabel>
						{ isLoadingAccounts ? (
							<Spinner />
						) : (
							<GitHubAccountsDropdown
								onAddAccount={ onNewInstallationRequest }
								accounts={ accounts }
								value={ account || accounts[ 0 ] }
								onChange={ setAccount }
							/>
						) }
					</FormFieldset>
					<FormFieldset style={ { flex: 1 } }>
						<FormLabel htmlFor="repoName">{ __( 'Repository name' ) }</FormLabel>
						<FormTextInput
							id="repoName"
							placehlder={ __( 'Repository name' ) }
							value={ repositoryName }
							onChange={ async ( event: ChangeEvent< HTMLInputElement > ) => {
								setRepositoryName( event.currentTarget.value );
							} }
						/>
					</FormFieldset>
				</div>
				<FormFieldset>
					<FormLabel htmlFor="deploy">{ __( 'Privacy' ) }</FormLabel>
					<div className="deploy-toggle">
						<FormToggle
							id="deploy"
							checked={ isPrivate }
							onChange={ () => setIsPrivate( ! isPrivate ) }
						/>
						<p style={ { margin: '0', marginLeft: '8px' } }>
							{ __( 'Create private repository' ) }
						</p>
					</div>
				</FormFieldset>
				<FormFieldset className="github-deployments-create-repository__project-type">
					<FormLabel>{ __( 'What are you building ' ) }</FormLabel>
					<FormRadioWithTemplateSelect
						label={ __( 'A theme' ) }
						projectType="theme"
						isChecked={ projectType === 'theme' }
						onChange={ () => {
							setProjectType( 'theme' );
						} }
						onTemplateSelected={ setTemplate }
						template={ template }
					/>
					<FormRadioWithTemplateSelect
						label={ __( 'A plugin' ) }
						projectType="plugin"
						isChecked={ projectType === 'plugin' }
						onChange={ () => {
							setProjectType( 'plugin' );
						} }
						onTemplateSelected={ setTemplate }
						template={ template }
					/>
					<FormRadioWithTemplateSelect
						label={ __( 'A site' ) }
						projectType="site"
						isChecked={ projectType === 'site' }
						onChange={ () => {
							setProjectType( 'site' );
						} }
						onTemplateSelected={ setTemplate }
						template={ template }
					/>
					<FormLabel htmlFor="targetDir">{ __( 'Destination directory' ) }</FormLabel>
					<FormTextInput
						id="targetDir"
						placehlder="/"
						value={ targetDir }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setTargetDir( event.currentTarget.value )
						}
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="deploy">{ __( 'Automatic deploys' ) }</FormLabel>
					<div className="deploy-toggle">
						<FormToggle
							id="deploy"
							checked={ isAutomated }
							onChange={ () => setIsAutomated( ! isAutomated ) }
						/>
						<p style={ { margin: '0', marginLeft: '8px' } }>{ __( 'Deploy changes on push ' ) }</p>
					</div>
				</FormFieldset>
				<Button
					variant="primary"
					disabled={ ! isFormValid || isPending }
					busy={ isPending }
					onClick={ handleCreateRepository }
				>
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
