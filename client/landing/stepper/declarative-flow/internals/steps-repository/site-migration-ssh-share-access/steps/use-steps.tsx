import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { HelpLink } from './help-link';
import { getSSHHostDisplayName, getSSHSupportUrl } from './ssh-host-support-urls';
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
	migrationError?: Error | null;
	onServerAddressChange: ( address: string ) => void;
	onPortChange: ( port: number ) => void;
	onServerVerify: () => void;
	onAuthMethodChange: ( method: 'password' | 'key' ) => void;
	onUsernameChange: ( username: string ) => void;
	onPasswordChange: ( password: string ) => void;
	onFindSSHDetailsSuccess: () => void;
	host?: string;
	onNoSSHAccess: () => void;
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
}

interface SSHFormState {
	foundSSHDetails: boolean;
	serverAddress: string;
	port: number;
	isServerVerified: boolean;
	authMethod: 'password' | 'key';
	username: string;
	password: string;
	migrationStarted: boolean;
}

const useStepsData = ( options: StepsDataOptions ): StepsData => {
	const translate = useTranslate();
	const hostDisplayName = getSSHHostDisplayName( options.host );
	const supportUrl = getSSHSupportUrl( options.host );
	const helpLink = <HelpLink href={ supportUrl } />;

	const stepsData: StepsData = [
		{
			key: FIND_SSH_DETAILS,
			title: translate( 'Find your SSH details' ),
			content: (
				<StepFindSSHDetails
					onSuccess={ options.onFindSSHDetailsSuccess }
					onNoSSHAccess={ options.onNoSSHAccess }
					hostDisplayName={ hostDisplayName }
					helpLink={ helpLink }
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
					helpLink={ helpLink }
					onServerAddressChange={ options.onServerAddressChange }
					onPortChange={ options.onPortChange }
					onVerify={ options.onServerVerify }
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
					error={ options.migrationError }
					onAuthMethodChange={ options.onAuthMethodChange }
					onUsernameChange={ options.onUsernameChange }
					onPasswordChange={ options.onPasswordChange }
					helpLink={ helpLink }
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
}: UseStepsOptions ): StepsObject => {
	const [ currentStep, setCurrentStep ] = useState( -1 );
	const [ lastCompleteStep, setLastCompleteStep ] = useState( -1 );
	const [ migrationError, setMigrationError ] = useState< Error | null >( null );

	// SSH Form State
	const [ formState, setFormState ] = useState< SSHFormState >( {
		foundSSHDetails: false,
		serverAddress: '',
		port: 22,
		isServerVerified: false,
		authMethod: 'password',
		username: '',
		password: '',
		migrationStarted: false,
	} );

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
		setFormState( ( prev ) => ( { ...prev, username } ) );
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
		migrationError,
		onServerAddressChange: handleServerAddressChange,
		onPortChange: handlePortChange,
		onServerVerify: handleServerVerify,
		onAuthMethodChange: handleAuthMethodChange,
		onUsernameChange: handleUsernameChange,
		onPasswordChange: handlePasswordChange,
		onFindSSHDetailsSuccess: handleFindSSHDetailsSuccess,
		onNoSSHAccess,
		host,
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
					setCurrentStep( index );
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
			( formState.authMethod === 'key' && false ) );

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
