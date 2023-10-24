import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import ThumbsDown from 'calypso/assets/images/odie/thumbs-down.svg';
import ThumbsUp from 'calypso/assets/images/odie/thumbs-up.svg';

import './style.scss';

const WasThisHelpfulButtons = () => {
	const [ isHelpful, setIsHelpful ] = useState< null | boolean >( null );
	const translate = useTranslate();

	// Return null if isHelpful is not null
	if ( isHelpful !== null ) {
		return null;
	}

	return (
		<div className="odie-feedback-component-container">
			<span className="odie-feedback-component-question">Was this helpful?</span>
			<span className="odie-feedback-component-button-container">
				<button className="odie-feedback-component-button" onClick={ () => setIsHelpful( true ) }>
					<img
						src={ ThumbsUp }
						alt={ translate( 'Thumbs up icon', {
							context: 'html alt tag',
							textOnly: true,
						} ) }
					/>
				</button>
				<button className="odie-feedback-component-button" onClick={ () => setIsHelpful( false ) }>
					<img
						src={ ThumbsDown }
						alt={ translate( 'Thumbs up icon', {
							context: 'html alt tag',
							textOnly: true,
						} ) }
					/>
				</button>
			</span>
		</div>
	);
};

export default WasThisHelpfulButtons;
