import { Button, FormLabel } from '@automattic/components';
import { ExternalLink, FormToggle, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset/index';
import FormTextInput from 'calypso/components/forms/form-text-input/index';
import { GitHubRepositoryData } from '../../use-github-repositories-query';

import './style.scss';

interface ConnectRepositoryDialogProps {
	repository: GitHubRepositoryData;
	goBack(): void;
}

export const GitHubConnectRepository = ( { repository, goBack }: ConnectRepositoryDialogProps ) => {
	const [ branch, setBranch ] = useState( repository.default_branch );
	const [ destPath, setDestPath ] = useState( '/' );
	const [ isAutoDeploy, setIsAutoDeploy ] = useState( false );

	return (
		<form className="github-deployments-connect-repository">
			<FormFieldset>
				<FormLabel>{ __( 'Repository' ) }</FormLabel>
				<div className="github-deployments-connect-repository__repository">
					<ExternalLink href={ `https://github.com/${ repository.full_name }` } target="_blank">
						{ repository.full_name }
					</ExternalLink>
					<Button compact onClick={ goBack }>
						{ __( 'Change' ) }
					</Button>
				</div>
			</FormFieldset>
			<FormFieldset>
				<FormLabel>{ __( 'Deployment branch' ) }</FormLabel>
				<SelectControl
					value={ { value: branch } }
					options={ [ { value: repository.default_branch, label: repository.default_branch } ] }
					onChange={ setBranch }
				/>
			</FormFieldset>
			<FormFieldset>
				<FormLabel>{ __( 'Destination directory' ) }</FormLabel>
				<FormTextInput
					value={ destPath }
					onChange={ ( event ) => setDestPath( event.currentTarget.value ) }
				/>
			</FormFieldset>
			<FormFieldset>
				<FormLabel>{ __( 'Automatic deploys' ) }</FormLabel>
				<div className="github-deployments-connect-repository__automatic-deploys">
					<FormToggle
						checked={ isAutoDeploy }
						onChange={ () => setIsAutoDeploy( ! isAutoDeploy ) }
					/>
					<span>{ __( 'Deploy changes on push' ) }</span>
				</div>
			</FormFieldset>
			<Button primary>{ __( 'Connect repository' ) }</Button>
		</form>
	);
};
