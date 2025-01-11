import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import cookie from 'cookie';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import './style.scss';

type SurveyProps = {
	slug: string;
	title: string;
	description: string;
	image: string;
	imageAlt: string;
	url: string;
	onDismiss: ( context: string ) => void;
};

const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

const Survey = ( { slug, title, description, image, imageAlt, url, onDismiss }: SurveyProps ) => {
	const surveyWrapper = useRef( document.createElement( 'div' ) ).current;
	const translate = useTranslate();
	const hasDismissedCookie = cookie.parse( document.cookie )?.[ slug ];

	useEffect( () => {
		surveyWrapper.setAttribute( 'aria-modal', 'true' );
		recordTracksEvent( 'calypso_survey_impression', { slug } );

		document.body.appendChild( surveyWrapper );
		return () => {
			document.body.removeChild( surveyWrapper );
		};
	}, [ slug, surveyWrapper, recordTracksEvent ] );

	const setDismissCookie = () => {
		document.cookie = cookie.serialize( slug, 'dismiss', {
			path: '/',
			maxAge: ONE_YEAR_IN_SECONDS,
		} );
	};

	const handleCTAClick = () => {
		recordTracksEvent( 'calypso_survey_clicked', { slug } );
	};

	const handleDismiss = ( context: string ) => {
		recordTracksEvent( 'calypso_survey_dismissed', { slug, context } );
		if ( context !== 'backdrop' ) {
			setDismissCookie();
		}

		onDismiss( context );
	};

	if ( hasDismissedCookie ) {
		return null;
	}

	return ReactDOM.createPortal(
		<div className="survey">
			<Button className="survey__backdrop" onClick={ () => handleDismiss( 'backdrop' ) } />
			<div className="survey__popup">
				<div className="survey__popup-img">
					<img src={ image } alt={ imageAlt } />
					<Button
						onClick={ () => handleDismiss( 'close-button' ) }
						className="survey__popup-img-close"
					>
						<Gridicon icon="cross" size={ 24 } />
					</Button>
				</div>
				<div className="survey__popup-content">
					<div className="survey__popup-content-title">{ title }</div>
					<div className="survey__popup-content-description">{ description }</div>
					<div className="survey__popup-content-buttons">
						<Button variant="tertiary" onClick={ () => handleDismiss( 'decline' ) }>
							{ translate( 'No thanks' ) }
						</Button>
						<Button
							variant="primary"
							href={ url }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ handleCTAClick }
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
