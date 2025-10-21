import page from '@automattic/calypso-router';
import { Button, Modal } from '@wordpress/components';
import { getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { A4A_REPORTS_SURVEY_PREFERENCE_KEY } from '../constants';

import './style.scss';

const SURVEY_URL = 'https://automattic.survey.fm/automattic-for-agencies-client-reports-beta';

export default function ReportsSurvey() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const surveyShown = useSelector( ( state ) =>
		getPreference( state, A4A_REPORTS_SURVEY_PREFERENCE_KEY )
	);

	const [ showSurvey, setShowSurvey ] = useState( false );

	// Handle URL parameter for showing survey modal
	useEffect( () => {
		const queryArgs = getQueryArgs( window.location.href );
		const showSurveyParam = queryArgs[ 'show-survey' ];

		if ( showSurveyParam === 'true' && ! surveyShown ) {
			setShowSurvey( true );
		}
	}, [ dispatch, surveyShown ] );

	const closeModal = () => {
		page.redirect(
			removeQueryArgs( window.location.pathname + window.location.search, 'show-survey' )
		);
		dispatch( savePreference( A4A_REPORTS_SURVEY_PREFERENCE_KEY, true ) );
		setShowSurvey( false );
	};

	const handleClose = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_survey_modal_close' ) );
		closeModal();
	};

	const handleSurveyClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_reports_survey_modal_survey_click' ) );
		closeModal();
	};

	if ( ! showSurvey ) {
		return null;
	}

	return (
		<Modal
			title={ translate( 'Congrats on your first Client Report!' ) }
			onRequestClose={ handleClose }
			className="reports-survey-modal"
		>
			<p className="reports-survey-modal__text">
				{ translate(
					'Do you have 2 minutes? Share your thoughts on our Client Reports BETA. Your feedback shapes our roadmap and helps us build the right tools for you and your clients.'
				) }
			</p>
			<div className="reports-survey-modal__buttons">
				<Button variant="primary" href={ SURVEY_URL } target="_blank" onClick={ handleSurveyClick }>
					{ translate( 'Take 2 minute survey ↗' ) }
				</Button>
			</div>
		</Modal>
	);
}
