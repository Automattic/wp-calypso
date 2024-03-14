import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import cookie from 'cookie';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import './style.scss';

const SurveyModal = ( {
	name,
	url,
	heading,
	title,
	surveyImage,
	description,
	dismissText,
	confirmText,
} ) => {
	const userId = useSelector( getCurrentUserId );
	const href = new URL( url );
	href.searchParams.set( 'user-id', userId );

	const [ hideNotice, setHideNotice ] = useState(
		'dismissed' === cookie.parse( document.cookie )?.sso_survey
	);

	const setSurveyCookie = ( value, maxAge ) => {
		document.cookie = cookie.serialize( name, value, {
			path: '/',
			maxAge,
		} );
	};

	const onClose = () => {
		setSurveyCookie( 'dismissed', 365 * 24 * 60 * 60 ); // 1 year
		setHideNotice( true );
	};

	if ( hideNotice ) {
		return null;
	}

	return (
		<div className="modal-survey-notice">
			<Button className="modal-survey-notice__backdrop" onClick={ onClose } />
			<div className="modal-survey-notice__popup">
				<div className="modal-survey-notice__popup-head">
					<div className="modal-survey-notice__popup-head-title">{ heading }</div>
					<Button onClick={ onClose } className="modal-survey-notice__popup-head-close">
						<Gridicon icon="cross" size={ 16 } />
					</Button>
				</div>
				{ surveyImage && (
					<div className="modal-survey-notice__popup-img">
						<img src={ surveyImage } alt={ heading } />
					</div>
				) }

				<div className="modal-survey-notice__popup-content">
					{ title && <div className="modal-survey-notice__popup-content-title">{ title }</div> }
					<div className="modal-survey-notice__popup-content-description">{ description }</div>
					<div className="modal-survey-notice__popup-content-buttons">
						<Button
							className="dmodal-survey-notice__popup-content-buttons-cancel"
							onClick={ onClose }
						>
							{ dismissText }
						</Button>
						<Button
							className="modal-survey-notice__popup-content-buttons-ok"
							href={ href.toString() }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ onClose }
						>
							{ confirmText }
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

SurveyModal.propTypes = {
	name: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	heading: PropTypes.string.isRequired,
	title: PropTypes.string,
	surveyImage: PropTypes.string,
	description: PropTypes.string.isRequired,
	dismissText: PropTypes.string.isRequired,
	confirmText: PropTypes.string.isRequired,
};

export default SurveyModal;
