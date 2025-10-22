import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { HelpLink } from './help-link';
import { getSSHHostDisplayName, getSSHSupportUrl } from './ssh-host-support-urls';
import { StepAddServerAddress } from './step-add-server-address';
import { StepFindSSHDetails } from './step-find-ssh-details';
import type { Task, Expandable } from '@automattic/launchpad';

const FIND_SSH_DETAILS = 'find-ssh-details';
const ADD_SERVER_ADDRESS = 'add-server-address';
const SHARE_SSH_ACCESS = 'share-ssh-access';

interface SSHFormState {
	foundSSHDetails: boolean;
	serverAddress: string;
	port: number;
	isServerVerified: boolean;
}

interface StepsDataOptions {
	fromUrl: string;
	siteId: number;
	siteName: string;
	serverAddress: string;
	port: number;
	isServerVerified: boolean;
	onServerAddressChange: ( address: string ) => void;
	onPortChange: ( port: number ) => void;
	onServerVerify: () => void;
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
}

interface UseStepsOptions {
	fromUrl: string;
	siteId: number;
	siteName: string;
	onComplete: () => void;
	host?: string;
	onNoSSHAccess: () => void;
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
			content: <div>Share SSH access</div>,
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
}: UseStepsOptions ): StepsObject => {
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ lastCompleteStep, setLastCompleteStep ] = useState( -1 );

	// SSH Form State
	const [ formState, setFormState ] = useState< SSHFormState >( {
		foundSSHDetails: false,
		serverAddress: '',
		port: 22,
		isServerVerified: false,
	} );

	// State update handlers
	const handleServerAddressChange = ( address: string ) => {
		setFormState( ( prev ) => ( { ...prev, serverAddress: address, isServerVerified: false } ) );
	};

	const handlePortChange = ( port: number ) => {
		setFormState( ( prev ) => ( { ...prev, port, isServerVerified: false } ) );
	};

	const handleServerVerify = () => {
		setFormState( ( prev ) => ( { ...prev, isServerVerified: true } ) );
		setCurrentStep( 2 );
		if ( lastCompleteStep < 1 ) {
			setLastCompleteStep( 1 );
		}
	};

	const handleFindSSHDetailsSuccess = () => {
		setFormState( ( prev ) => ( { ...prev, foundSSHDetails: true } ) );
		setCurrentStep( 1 );
		if ( lastCompleteStep < 0 ) {
			setLastCompleteStep( 0 );
		}
	};

	const stepsData = useStepsData( {
		fromUrl,
		siteId,
		siteName,
		serverAddress: formState.serverAddress,
		port: formState.port,
		isServerVerified: formState.isServerVerified,
		onServerAddressChange: handleServerAddressChange,
		onPortChange: handlePortChange,
		onServerVerify: handleServerVerify,
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
				return false;
			default:
				return false;
		}
	};

	const steps: Steps = stepsData.map( ( step, index ) => {
		// Allow clicking on visited steps only, so users can see the previous steps again.
		const onItemClick =
			lastCompleteStep < index
				? undefined
				: () => {
						setCurrentStep( index );
				  };

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

	return {
		steps,
		completedSteps: lastCompleteStep + 1,
		formState,
		allStepsCompleted,
	};
};
