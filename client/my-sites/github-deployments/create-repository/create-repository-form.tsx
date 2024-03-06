import { Button, FormInputValidation, FormLabel } from '@automattic/components';
import { FormToggle, Spinner } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, FormEventHandler, useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { GitHubInstallationsDropdown } from 'calypso/my-sites/github-deployments/components/installations-dropdown';
import { useLiveInstallations } from 'calypso/my-sites/github-deployments/components/installations-dropdown/use-live-installations';
import { AutomatedDeploymentsToggle } from '../components/automated-deployments-toggle';
import {
	FormRadioWithTemplateSelect,
	ProjectType,
} from '../components/form-radio-with-template-select';
import {
	RepositoryTemplate,
	repositoryTemplates,
} from '../components/form-radio-with-template-select/templates';
import { TargetDirInput } from '../components/target-dir-input';
import { MutationVariables as CreateDeploymentMutationVariables } from '../deployment-creation/use-create-code-deployment';
import { DeploymentStyleDescription } from './deployment-style-description';
import { MutationVariables as CreateRepositoryMutationVariables } from './use-create-repository';

import './style.scss';

export type OnRepositoryCreatedParams = CreateRepositoryMutationVariables &
	Omit< CreateDeploymentMutationVariables, 'externalRepositoryId' | 'branchName' >;

type CreateRepositoryFormProps = {
	onRepositoryCreated( args: OnRepositoryCreatedParams ): void;
	isPending: boolean;
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

	const [ isSubmitted, setSubmitted ] = useState( false );

	const handleCreateRepository: FormEventHandler = ( e ) => {
		e.preventDefault();

		setSubmitted( true );

		if ( ! installation || ! repositoryName ) {
			return;
		}

		onRepositoryCreated( {
			installationId: installation.external_id,
			template: template.repositoryName,
			accountName: installation.account_name,
			repositoryName,
			targetDir,
			isPrivate,
			isAutomated,
			workflowPath: template.workflowFilename,
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
			<form
				className="github-deployments-create-repository__configuration"
				onSubmit={ handleCreateRepository }
			>
				<FormFieldset>
					<div className="github-deployments-create-repository__repository">
						<div>
							<FormLabel htmlFor="githubInstallation">{ __( 'GitHub account' ) }</FormLabel>
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
						</div>
						<div css={ { flex: '1' } }>
							<FormLabel htmlFor="repoName">{ __( 'Repository name' ) }</FormLabel>
							<FormTextInput
								id="repoName"
								placeholder={ __( 'my-amazing-repository' ) }
								placehlder={ __( 'Repository name' ) }
								value={ repositoryName }
								onChange={ async ( event: ChangeEvent< HTMLInputElement > ) => {
									setRepositoryName( event.currentTarget.value.trim() );
								} }
							/>
						</div>
					</div>
					{ isSubmitted && ( ! installation || ! repositoryName ) && (
						<FormInputValidation
							css={ { paddingBottom: '0 !important' } }
							isError
							text={
								! installation
									? __( 'Please select an account' )
									: __( 'Please type the name of the repository' )
							}
						/>
					) }
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="is-private">{ __( 'Privacy' ) }</FormLabel>
					<div className="github-deployments-create-repository__switch">
						<FormToggle
							id="is-private"
							checked={ isPrivate }
							onChange={ () => setIsPrivate( ! isPrivate ) }
						/>
						{ __( 'Create private repository' ) }
					</div>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ __( 'What are you building' ) }</FormLabel>
					<div className="github-deployments-create-repository__project-type">
						<FormRadioWithTemplateSelect
							label={ __( 'A theme' ) }
							projectType="theme"
							isChecked={ projectType === 'theme' }
							onTemplateSelected={ ( template ) => {
								setProjectType( 'theme' );
								setTemplate( template );
							} }
							template={ template }
						/>
						<FormRadioWithTemplateSelect
							label={ __( 'A plugin' ) }
							projectType="plugin"
							isChecked={ projectType === 'plugin' }
							onTemplateSelected={ ( template ) => {
								setProjectType( 'plugin' );
								setTemplate( template );
							} }
							template={ template }
						/>
						<FormRadioWithTemplateSelect
							label={ __( 'A site' ) }
							projectType="site"
							isChecked={ projectType === 'site' }
							onTemplateSelected={ ( template ) => {
								setProjectType( 'site' );
								setTemplate( template );
							} }
							template={ template }
						/>
					</div>
				</FormFieldset>
				<TargetDirInput onChange={ setTargetDir } value={ targetDir } />
				<AutomatedDeploymentsToggle
					onChange={ setIsAutomated }
					value={ isAutomated }
					hasWorkflowPath={ !! template.workflowFilename }
				/>
				<Button
					primary
					type="submit"
					busy={ isPending }
					disabled={ isPending }
					onClick={ handleCreateRepository }
				>
					{ __( 'Create repository' ) }
				</Button>
			</form>
			<div className="github-deployments-create-repository__deployment-style">
				<DeploymentStyleDescription
					repositoryName={ template.repositoryName }
					branchName="trunk"
					workflowFilename={ template.workflowFilename }
				/>
			</div>
		</div>
	);
};
