import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Checklist, ChecklistItem, Task } from '@automattic/launchpad';
import React, { useState } from 'react';
import InterestsModal from './interests-modal';
import SubscribeModal from './subscribe-modal';
import './style.scss';

const ReaderOnboarding = () => {
	const [ isInterestsModalOpen, setIsInterestsModalOpen ] = useState( false );
	const [ isDiscoverModalOpen, setIsDiscoverModalOpen ] = useState( false );

	const itemClickHandler = ( task: Task ) => {
		recordTracksEvent( 'calypso_reader_onboarding_task_click', {
			task: task.id,
		} );
		task?.actionDispatch?.();
	};

	const tasks: Task[] = [
		{
			id: 'select-interests',
			title: 'Select some of your interests',
			actionDispatch: () => setIsInterestsModalOpen( true ),
			completed: false,
			disabled: false,
		},
		{
			id: 'discover-sites',
			title: "Discover and subscribe to sites you'll love",
			actionDispatch: () => setIsDiscoverModalOpen( true ),
			completed: false,
			disabled: false,
		},
	];

	return (
		<>
			<div className="reader-onboarding">
				<div className="reader-onboarding__intro-column">
					<h2>Your personal reading adventure</h2>
					<p>Tailor your feed, connect with your favorite topics</p>
				</div>
				<div className="reader-onboarding__steps-column">
					<Checklist>
						{ tasks.map( ( task ) => (
							<ChecklistItem
								task={ task }
								key={ task.id }
								onClick={ () => itemClickHandler( task ) }
							/>
						) ) }
					</Checklist>
				</div>
			</div>

			<InterestsModal
				isOpen={ isInterestsModalOpen }
				onClose={ () => setIsInterestsModalOpen( false ) }
			/>
			<SubscribeModal
				isOpen={ isDiscoverModalOpen }
				onClose={ () => setIsDiscoverModalOpen( false ) }
			/>
		</>
	);
};

export default ReaderOnboarding;
