import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { SURVEYS } from './constants';
import './style.scss';

type SurveyProps = {
	slug: string;
	onClose: ( context: string ) => void;
	onSurveyClick: () => void;
};

const Survey = ( { slug, onSurveyClick, onClose }: SurveyProps ) => {
	const surveyWrapper = useRef( document.createElement( 'div' ) ).current;
	const translate = useTranslate();
	const content = SURVEYS[ slug ];

	useEffect( () => {
		surveyWrapper.setAttribute( 'aria-modal', 'true' );
		document.body.appendChild( surveyWrapper );

		return () => {
			document.body.removeChild( surveyWrapper );
		};
	}, [ surveyWrapper ] );

	if ( ! content || ! content.href ) {
		return null;
	}

	return ReactDOM.createPortal(
		<div className="survey">
			<Button className="survey__backdrop" onClick={ () => onClose( 'backdrop' ) } />
			<div className="survey__popup">
				<div className="survey__popup-img">
					<img src={ content.image } alt={ content.imageAlt } />
					<Button onClick={ () => onClose( 'close-button' ) } className="survey__popup-img-close">
						<Gridicon icon="cross" size={ 24 } />
					</Button>
				</div>
				<div className="survey__popup-content">
					<div className="survey__popup-content-title">{ content.title }</div>
					<div className="survey__popup-content-description">{ content.description }</div>
					<div className="survey__popup-content-buttons">
						<Button variant="tertiary" onClick={ () => onClose( 'decline' ) }>
							{ translate( 'No thanks' ) }
						</Button>
						<Button
							variant="primary"
							href={ content.href }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ onSurveyClick }
						>
							{ translate( 'Take survey' ) }
						</Button>
					</div>
				</div>
			</div>
		</div>,
		surveyWrapper
	);
};

export default Survey;
