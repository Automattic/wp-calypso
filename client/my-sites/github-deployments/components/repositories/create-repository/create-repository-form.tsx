import { FormLabel, Button } from '@automattic/components';
import { FormToggle, Spinner } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { GitHubInstallationsDropdown } from 'calypso/my-sites/github-deployments/components/installations-dropdown';
import { useLiveInstallations } from 'calypso/my-sites/github-deployments/components/installations-dropdown/use-live-installations';
import { DeploymentStyle } from '../deployment-style/deployment-style';
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
		installation,
		setInstallation,
		installations = [],
		onNewInstallationRequest,
		isLoadingInstallations,
	} = useLiveInstallations();
	const [ repositoryName, setRepositoryName ] = useState( '' );
	const [ targetDir, setTargetDir ] = useState( '/' );
	const [ projectType, setProjectType ] = useState< ProjectType >( 'plugin' );
	const [ isPrivate, setIsPrivate ] = useState( true );
	const [ isAutomated, setIsAutomated ] = useState( false );
	const [ template, setTemplate ] = useState< RepositoryTemplate >(
		repositoryTemplates.plugin[ 0 ]
	);

	const isFormValid = repositoryName.trim() && ! isLoadingInstallations;

	const handleCreateRepository = () => {
		if ( ! installation ) {
			return;
		}

		onRepositoryCreated( {
			installationId: installation.external_id,
			template: template.value,
			accountName: installation.account_name,
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
						<FormLabel htmlFor="githubInstallation">{ __( 'Github installation' ) }</FormLabel>
						{ isLoadingInstallations ? (
							<Spinner />
						) : (
							<GitHubInstallationsDropdown
								onAddInstallation={ onNewInstallationRequest }
								installations={ installations }
								value={ installation }
								onChange={ setInstallation }
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
					primary
					busy={ isPending }
					disabled={ ! isFormValid }
					onClick={ handleCreateRepository }
				>
					{ __( 'Create repository' ) }
				</Button>
			</form>
			<DeploymentStyle />
		</div>
	);
};
