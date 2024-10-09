import React, { useState } from 'react';
import InterestsModal from './interests-modal';
import SubscribeModal from './subscribe-modal';

import './style.scss';

const ReaderOnboarding = () => {
	const [ isInterestsModalOpen, setIsInterestsModalOpen ] = useState( false );
	const [ isDiscoverModalOpen, setIsDiscoverModalOpen ] = useState( false );

	return (
		<>
			<div className="reader-onboarding">
				<div className="reader-onboarding__intro-column">
					<h2>Your personal reading adventure</h2>
					<p>Tailor your feed, connect with your favorite topics</p>
				</div>
				<div className="reader-onboarding__steps-column">
					<ul>
						<li>
							<button
								className="reader-onboarding__link-button"
								onClick={ () => setIsInterestsModalOpen( true ) }
							>
								Select some of your interests
							</button>
						</li>
						<li>
							<button
								className="reader-onboarding__link-button"
								onClick={ () => setIsDiscoverModalOpen( true ) }
							>
								Discover and subscribe to sites you'll love
							</button>
						</li>
					</ul>
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
