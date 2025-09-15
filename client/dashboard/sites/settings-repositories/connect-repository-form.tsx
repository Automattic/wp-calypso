import {
	Button,
	SelectControl,
	ToggleControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo, useEffect } from 'react';
import { useCreateCodeDeployment } from './use-create-code-deployment';
import type { Site } from '@automattic/api-core';

interface Repository {
	id: number;
	name: string;
	owner: string;
	default_branch?: string;
}

interface ConnectRepositoryFormProps {
	site: Site;
	onConnected: () => void;
	onCancel: () => void;
}

export const ConnectRepositoryForm = ( {
	site,
	onConnected,
	onCancel,
}: ConnectRepositoryFormProps ) => {
	const [ selectedRepository, setSelectedRepository ] = useState< Repository | null >( null );
	const [ isRepositoryModalOpen, setIsRepositoryModalOpen ] = useState( false );
	const [ branch, setBranch ] = useState( 'main' );
	const [ targetDir, setTargetDir ] = useState( '/' );
	const [ isAutomated, setIsAutomated ] = useState( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	// Mock repositories for now - in real implementation, this would come from GitHub API
	const mockRepositories: Repository[] = [
		{ id: 1, name: 'my-wordpress-theme', owner: 'myuser', default_branch: 'main' },
		{ id: 2, name: 'custom-plugin', owner: 'myuser', default_branch: 'master' },
		{ id: 3, name: 'site-config', owner: 'myorg', default_branch: 'main' },
	];

	const branchOptions = useMemo( () => {
		// In real implementation, this would fetch from GitHub API
		if ( selectedRepository?.default_branch ) {
			return [
				{ label: selectedRepository.default_branch, value: selectedRepository.default_branch },
				{ label: 'develop', value: 'develop' },
				{ label: 'staging', value: 'staging' },
			];
		}
		return [
			{ label: 'main', value: 'main' },
			{ label: 'master', value: 'master' },
			{ label: 'develop', value: 'develop' },
		];
	}, [ selectedRepository ] );

	const targetDirOptions = [
		{ label: __( 'Root directory (/)' ), value: '/' },
		{ label: __( 'wp-content' ), value: '/wp-content' },
		{ label: __( 'wp-content/themes' ), value: '/wp-content/themes' },
		{ label: __( 'wp-content/plugins' ), value: '/wp-content/plugins' },
	];

	const { createDeployment } = useCreateCodeDeployment( site.ID, {
		onSuccess: () => {
			onConnected();
		},
		onError: () => {
			// Error handling would be implemented with proper notices
			setIsSubmitting( false );
		},
	} );

	useEffect( () => {
		if ( selectedRepository?.default_branch && selectedRepository.default_branch !== branch ) {
			setBranch( selectedRepository.default_branch );
		}
	}, [ selectedRepository, branch ] );

	const handleSubmit = async () => {
		if ( ! selectedRepository ) {
			return;
		}

		setIsSubmitting( true );

		try {
			await createDeployment( {
				externalRepositoryId: selectedRepository.id,
				branchName: branch,
				targetDir,
				installationId: 12345, // This would come from GitHub app installation
				isAutomated,
			} );
		} catch ( error ) {
			setIsSubmitting( false );
		}
	};

	const handleRepositorySelect = ( repository: Repository ) => {
		setSelectedRepository( repository );
		setIsRepositoryModalOpen( false );
	};

	const isFormValid = selectedRepository && branch && targetDir;

	return (
		<>
			<VStack spacing={ 4 }>
				<VStack spacing={ 2 }>
					<Text weight="600">{ __( 'Repository' ) }</Text>
					<HStack>
						{ selectedRepository ? (
							<Text>
								{ selectedRepository.owner }/{ selectedRepository.name }
							</Text>
						) : (
							<Text variant="muted">{ __( 'No repository selected' ) }</Text>
						) }
						<Button variant="secondary" onClick={ () => setIsRepositoryModalOpen( true ) }>
							{ selectedRepository ? __( 'Change Repository' ) : __( 'Select Repository' ) }
						</Button>
					</HStack>
				</VStack>

				<SelectControl
					label={ __( 'Deployment Branch' ) }
					value={ branch }
					options={ branchOptions }
					onChange={ setBranch }
					help={ __( 'Select the branch to deploy from this repository.' ) }
				/>

				<SelectControl
					label={ __( 'Target Directory' ) }
					value={ targetDir }
					options={ targetDirOptions }
					onChange={ setTargetDir }
					help={ __( 'Choose where to deploy the repository contents on your site.' ) }
				/>

				<ToggleControl
					label={ __( 'Automated Deployments' ) }
					checked={ isAutomated }
					onChange={ setIsAutomated }
					help={ __( 'Automatically deploy when changes are pushed to the selected branch.' ) }
				/>

				<HStack justify="flex-end">
					<Button variant="tertiary" onClick={ onCancel }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ handleSubmit }
						isBusy={ isSubmitting }
						disabled={ ! isFormValid || isSubmitting }
						__next40pxDefaultSize
					>
						{ __( 'Connect Repository' ) }
					</Button>
				</HStack>
			</VStack>

			{ isRepositoryModalOpen && (
				<Modal
					title={ __( 'Select Repository' ) }
					onRequestClose={ () => setIsRepositoryModalOpen( false ) }
				>
					<VStack spacing={ 4 }>
						<Text>{ __( 'Choose a repository to connect to this site.' ) }</Text>
						<VStack spacing={ 2 }>
							{ mockRepositories.map( ( repo ) => (
								<Button
									key={ repo.id }
									variant="secondary"
									onClick={ () => handleRepositorySelect( repo ) }
									style={ { justifyContent: 'flex-start', textAlign: 'left' } }
								>
									{ repo.owner }/{ repo.name }
								</Button>
							) ) }
						</VStack>
						<Text variant="muted" size="13">
							{ __(
								'To connect a different repository, you may need to install the WordPress.com GitHub app first.'
							) }
						</Text>
					</VStack>
				</Modal>
			) }
		</>
	);
};
