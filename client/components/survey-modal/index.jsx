import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import classNames from 'classnames';
import cookie from 'cookie';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import './style.scss';

const SurveyModal = ( {
	name,
	eventName,
	className,
	url,
	heading,
	title,
	surveyImage,
	description,
	dismissText,
	confirmText,
} ) => {
	const cookieAge = 365 * 24 * 60 * 60; // 1 year
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
		setSurveyCookie( 'dismissed', cookieAge );
		setHideNotice( true );

		if ( eventName ) {
			recordTracksEvent( `${ eventName }_survey_dismissed` );
		}
	};

	const onConfirm = () => {
		setSurveyCookie( 'dismissed', cookieAge );
		setHideNotice( true );

		if ( eventName ) {
			recordTracksEvent( `${ eventName }_survey_clicked` );
		}
	};

	useEffect( () => {
		if ( eventName && ! hideNotice ) {
			recordTracksEvent( `${ eventName }_survey_showed` );
		}
	}, [ recordTracksEvent ] );

	if ( hideNotice ) {
		return null;
	}

	return (
		<div className={ classNames( 'modal-survey-notice', className ) }>
			<Button className="modal-survey-notice__backdrop" onClick={ onClose } />
			<div className="modal-survey-notice__popup">
				{ heading && (
					<div className="modal-survey-notice__popup-head">
						<div className="modal-survey-notice__popup-head-title">{ heading }</div>
						<Button onClick={ onClose } className="modal-survey-notice__popup-head-close">
							<Gridicon icon="cross" size={ 16 } />
						</Button>
					</div>
				) }

				{ ! heading && (
					<Button onClick={ onClose } className="modal-survey-notice__popup-head-close">
						<Gridicon icon="cross" size={ 16 } />
					</Button>
				) }

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
							className="modal-survey-notice__popup-content-buttons-cancel"
							onClick={ onClose }
						>
							{ dismissText }
						</Button>
						<Button
							className="modal-survey-notice__popup-content-buttons-ok"
							href={ href.toString() }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ onConfirm }
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
	eventName: PropTypes.string,
	className: PropTypes.string,
	url: PropTypes.string.isRequired,
	heading: PropTypes.string,
	title: PropTypes.string,
	surveyImage: PropTypes.string,
	description: PropTypes.string.isRequired,
	dismissText: PropTypes.string.isRequired,
	confirmText: PropTypes.string.isRequired,
};

export default SurveyModal;
