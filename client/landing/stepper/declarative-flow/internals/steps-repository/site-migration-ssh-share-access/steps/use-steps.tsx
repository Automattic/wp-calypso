import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useGenerateSSHKey } from '../hooks/use-generate-ssh-key';
import { HelpLink } from './help-link';
import { getSSHHostDisplayName, getSSHSupportDoc } from './ssh-host-support-urls';
import { StepAddServerAddress } from './step-add-server-address';
import { StepFindSSHDetails } from './step-find-ssh-details';
import { StepShareSSHAccess } from './step-share-ssh-access';
import type { Task, Expandable } from '@automattic/launchpad';

const FIND_SSH_DETAILS = 'find-ssh-details';
const ADD_SERVER_ADDRESS = 'add-server-address';
const SHARE_SSH_ACCESS = 'share-ssh-access';

interface StepsDataOptions {
	fromUrl: string;
	siteId: number;
	siteName: string;
	serverAddress: string;
	port: number;
	isServerVerified: boolean;
	authMethod: 'password' | 'key';
	username: string;
	password: string;
	sshPublicKey: string;
	isGeneratingKey: boolean;
	isUsernameLockedForKey: boolean;
	hostDisplayName?: string;
	generateKeyError?: Error | null;
	migrationError?: Error | null;
	onServerAddressChange: ( address: string ) => void;
	onPortChange: ( port: number ) => void;
	onServerVerify: () => void;
	onAuthMethodChange: ( method: 'password' | 'key' ) => void;
	onUsernameChange: ( username: string ) => void;
	onPasswordChange: ( password: string ) => void;
	onGenerateSSHKey: () => void;
	onEditUsername: () => void;
	onFindSSHDetailsSuccess: () => void;
	host?: string;
	onNoSSHAccess: () => void;
	isTransferring: boolean;
	shouldGenerateKey: boolean;
	isInputDisabled: boolean;
}

interface StepData {
	key: string;
	title: string | React.ReactNode;
	content: JSX.Element;
}

type StepsData = StepData[];

interface Step {
	task: Task;
	expandable?: Expandable;
	onClick?: () => void;
}

export type Steps = Step[];

interface StepsObject {
	steps: Steps;
	completedSteps: number;
	formState: SSHFormState;
	allStepsCompleted: boolean;
	canStartMigration: boolean;
	onMigrationStarted: () => void;
	setMigrationError: ( error: Error | null ) => void;
}

interface UseStepsOptions {
	fromUrl: string;
	siteId: number;
	siteName: string;
	host?: string;
	onNoSSHAccess: () => void;
	migrationStatus?: 'queued' | 'in-progress' | 'migrating' | 'completed' | 'failed';
	isTransferring: boolean;
	isInputDisabled: boolean;
}

interface SSHFormState {
	foundSSHDetails: boolean;
	serverAddress: string;
	port: number;
	isServerVerified: boolean;
	authMethod: 'password' | 'key';
	username: string;
	password: string;
	sshPublicKey: string;
	migrationStarted: boolean;
}

const useStepsData = ( options: StepsDataOptions ): StepsData => {
	const translate = useTranslate();
	const hostDisplayName = getSSHHostDisplayName( options.host );
	const supportDoc = getSSHSupportDoc( options.host );

	const stepsData: StepsData = [
		{
			key: FIND_SSH_DETAILS,
			title: translate( 'Find your SSH details' ),
			content: (
				<StepFindSSHDetails
					onSuccess={ options.onFindSSHDetailsSuccess }
					onNoSSHAccess={ options.onNoSSHAccess }
					hostDisplayName={ hostDisplayName }
					helpLink={
						<HelpLink
							supportLink={ supportDoc.url }
							supportPostId={ supportDoc.postId }
							stepKey={ FIND_SSH_DETAILS }
						/>
					}
					isInputDisabled={ options.isInputDisabled }
				/>
			),
		},
		{
			key: ADD_SERVER_ADDRESS,
			title: translate( 'Add SSH server address' ),
			content: (
				<StepAddServerAddress
					siteId={ options.siteId }
					serverAddress={ options.serverAddress }
					port={ options.port }
					hostDisplayName={ hostDisplayName }
					helpLink={
						<HelpLink
							supportLink={ supportDoc.url }
							supportPostId={ supportDoc.postId }
							stepKey={ ADD_SERVER_ADDRESS }
						/>
					}
					onServerAddressChange={ options.onServerAddressChange }
					onPortChange={ options.onPortChange }
					onVerify={ options.onServerVerify }
					isInputDisabled={ options.isInputDisabled }
				/>
			),
		},
		{
			key: SHARE_SSH_ACCESS,
			title: translate( 'Share SSH access' ),
			content: (
				<StepShareSSHAccess
					authMethod={ options.authMethod }
					username={ options.username }
					password={ options.password }
					sshPublicKey={ options.sshPublicKey }
					isGeneratingKey={ options.isGeneratingKey }
					isUsernameLockedForKey={ options.isUsernameLockedForKey }
					hostDisplayName={ options.hostDisplayName }
					generateError={ options.generateKeyError }
					error={ options.migrationError }
					onAuthMethodChange={ options.onAuthMethodChange }
					onUsernameChange={ options.onUsernameChange }
					onPasswordChange={ options.onPasswordChange }
					onGenerateSSHKey={ options.onGenerateSSHKey }
					onEditUsername={ options.onEditUsername }
					helpLink={
						<HelpLink
							supportLink={ supportDoc.url }
							supportPostId={ supportDoc.postId }
							stepKey={ SHARE_SSH_ACCESS }
						/>
					}
					isTransferring={ options.isTransferring }
					shouldGenerateKey={ options.shouldGenerateKey }
					isInputDisabled={ options.isInputDisabled }
				/>
			),
		},
	];

	return stepsData;
};

export const useSteps = ( {
	fromUrl,
	siteId,
	siteName,
	onNoSSHAccess,
	host,
	migrationStatus,
	isTransferring,
	isInputDisabled,
}: UseStepsOptions ): StepsObject => {
	const [ currentStep, setCurrentStep ] = useState( -1 );
	const [ lastCompleteStep, setLastCompleteStep ] = useState( -1 );
	const [ migrationError, setMigrationError ] = useState< Error | null >( null );
	const [ shouldGenerateKey, setShouldGenerateKey ] = useState( false );

	// SSH Form State
	const [ formState, setFormState ] = useState< SSHFormState >( {
		foundSSHDetails: false,
		serverAddress: '',
		port: 22,
		isServerVerified: false,
		authMethod: 'password',
		username: '',
		password: '',
		sshPublicKey: '',
		migrationStarted: false,
	} );

	// SSH Key generation hook
	const {
		mutate: generateSSHKey,
		isPending: isGeneratingKey,
		error: generateKeyError,
	} = useGenerateSSHKey();

	// State update handlers
	const handleServerAddressChange = ( address: string ) => {
		setFormState( ( prev ) => ( {
			...prev,
			serverAddress: address,
			isServerVerified: false,
			migrationStarted: false,
		} ) );
		// If server verification was completed, reset progress since it needs to be verified again
		if ( lastCompleteStep >= 1 ) {
			setLastCompleteStep( 0 );
		}
	};

	const handlePortChange = ( port: number ) => {
		setFormState( ( prev ) => ( {
			...prev,
			port,
			isServerVerified: false,
			migrationStarted: false,
		} ) );
		// If server verification was completed, reset progress since it needs to be verified again
		if ( lastCompleteStep >= 1 ) {
			setLastCompleteStep( 0 );
		}
	};

	const handleServerVerify = () => {
		setFormState( ( prev ) => ( { ...prev, isServerVerified: true } ) );
		setCurrentStep( 2 );
		if ( lastCompleteStep < 1 ) {
			setLastCompleteStep( 1 );
		}
	};

	const handleAuthMethodChange = ( method: 'password' | 'key' ) => {
		setFormState( ( prev ) => ( { ...prev, authMethod: method } ) );
	};

	const handleUsernameChange = ( username: string ) => {
		setFormState( ( prev ) => ( { ...prev, username, sshPublicKey: '' } ) );
	};

	const handlePasswordChange = ( password: string ) => {
		setFormState( ( prev ) => ( { ...prev, password } ) );
	};

	const handleFindSSHDetailsSuccess = () => {
		setFormState( ( prev ) => ( { ...prev, foundSSHDetails: true } ) );
		setCurrentStep( 1 );
		if ( lastCompleteStep < 0 ) {
			setLastCompleteStep( 0 );
		}
	};

	const handleMigrationStarted = () => {
		setFormState( ( prev ) => ( { ...prev, migrationStarted: true } ) );
	};

	const triggerGenerateSSHKey = useCallback( () => {
		generateSSHKey(
			{
				siteId,
				remoteUser: formState.username,
				remoteHost: formState.serverAddress,
				remoteDomain: fromUrl,
			},
			{
				onSuccess: ( data ) => {
					setFormState( ( prev ) => ( { ...prev, sshPublicKey: data.ssh_public_key } ) );
				},
			}
		);
	}, [ generateSSHKey, siteId, formState.username, formState.serverAddress, fromUrl ] );

	const handleGenerateSSHKey = () => {
		if ( isTransferring ) {
			setShouldGenerateKey( true );
			return;
		}

		triggerGenerateSSHKey();
	};

	// Auto-generate SSH key when transfer completes
	useEffect( () => {
		if ( ! isTransferring && shouldGenerateKey ) {
			setShouldGenerateKey( false );
			triggerGenerateSSHKey();
		}
	}, [ isTransferring, shouldGenerateKey, triggerGenerateSSHKey ] );

	const handleEditUsername = () => {
		setFormState( ( prev ) => ( { ...prev, sshPublicKey: '' } ) );
	};

	const hostDisplayName = getSSHHostDisplayName( host );

	const stepsData = useStepsData( {
		fromUrl,
		siteId,
		siteName,
		serverAddress: formState.serverAddress,
		port: formState.port,
		isServerVerified: formState.isServerVerified,
		authMethod: formState.authMethod,
		username: formState.username,
		password: formState.password,
		sshPublicKey: formState.sshPublicKey,
		isGeneratingKey,
		isUsernameLockedForKey: !! formState.sshPublicKey,
		hostDisplayName,
		generateKeyError,
		migrationError,
		onServerAddressChange: handleServerAddressChange,
		onPortChange: handlePortChange,
		onServerVerify: handleServerVerify,
		onAuthMethodChange: handleAuthMethodChange,
		onUsernameChange: handleUsernameChange,
		onPasswordChange: handlePasswordChange,
		onGenerateSSHKey: handleGenerateSSHKey,
		onEditUsername: handleEditUsername,
		onFindSSHDetailsSuccess: handleFindSSHDetailsSuccess,
		onNoSSHAccess,
		host,
		isTransferring,
		shouldGenerateKey,
		isInputDisabled,
	} );

	const isComplete = ( stepKey: string ) => {
		switch ( stepKey ) {
			case FIND_SSH_DETAILS:
				return formState.foundSSHDetails;
			case ADD_SERVER_ADDRESS:
				return formState.isServerVerified;
			case SHARE_SSH_ACCESS:
				return migrationStatus === 'migrating' || migrationStatus === 'completed';
			default:
				return false;
		}
	};

	const steps: Steps = stepsData.map( ( step, index ) => {
		// Allow clicking on:
		// 1. The first step (always accessible)
		// 2. Previously completed steps (can review)
		// 3. The next step after last completed (can progress forward)
		const canClick = index === 0 || index <= lastCompleteStep + 1;
		const onItemClick = canClick
			? () => {
					const newStepState = currentStep === index ? -1 : index;
					const isOpening = newStepState !== -1;
					recordTracksEvent( 'calypso_site_migration_ssh_action', {
						step: step.key,
						action: isOpening ? 'expand_accordion' : 'collapse_accordion',
					} );
					setCurrentStep( newStepState );
			  }
			: undefined;

		// Render the content with the step-specific elements
		const contentNode = <>{ step.content }</>;

		return {
			task: {
				id: step.key,
				title: step.title,
				completed: isComplete( step.key ),
				disabled: false,
			},
			expandable: {
				content: contentNode,
				isOpen: currentStep === index,
			},
			onClick: onItemClick,
		};
	} );

	const allStepsCompleted = steps.every( ( step ) => step.task.completed );

	const canStartMigration =
		formState.foundSSHDetails &&
		formState.isServerVerified &&
		formState.username.length > 0 &&
		( ( formState.authMethod === 'password' && formState.password.length > 0 ) ||
			( formState.authMethod === 'key' && formState.sshPublicKey.length > 0 ) );

	return {
		steps,
		completedSteps: lastCompleteStep + 1,
		formState,
		allStepsCompleted,
		canStartMigration,
		onMigrationStarted: handleMigrationStarted,
		setMigrationError,
	};
};
