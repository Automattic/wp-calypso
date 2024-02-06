import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import surveyImage from 'calypso/assets/images/illustrations/developer-survey.svg';

type DevSurveyNotice = {
	onClose: () => void;
	onOk: () => void;
	localeSlug: string;
};

export const DevSurveyNotice = ( { onClose, onOk, localeSlug }: DevSurveyNotice ) => {
	const translate = useTranslate();

	const href =
		localeSlug === 'es'
			? 'https://wordpressdotcom.survey.fm/developer-survey-es'
			: 'https://wordpressdotcom.survey.fm/developer-survey';

	return (
		<div className="developer-survey-notice">
			<div className="developer-survey-notice__backdrop" />
			<div className="developer-survey-notice__popup">
				<div className="developer-survey-notice__popup-img">
					<img src={ surveyImage } alt="" />
				</div>
				<div className="developer-survey-notice__popup-content">
					<div className="developer-survey-notice__popup-content-title">
						{ translate( 'Hey developer!' ) }
					</div>
					<div className="developer-survey-notice__popup-content-description">
						{ translate(
							"How do you use WordPress.com? Spare a moment? We'd love to hear what you think in a quick survey."
						) }
					</div>
					<div className="developer-survey-notice__popup-content-buttons">
						<Button
							className="developer-survey-notice__popup-content-buttons-cancel"
							onClick={ onClose }
						>
							{ translate( 'Close' ) }
						</Button>
						<Button
							className="developer-survey-notice__popup-content-buttons-ok"
							href={ href }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ onOk }
						>
							{ translate( 'Take survey' ) }
						</Button>
					</div>
					<Button onClick={ onClose } className="developer-survey-notice__popup-content-close">
						<Gridicon icon="cross" size={ 24 } />
					</Button>
				</div>
			</div>
		</div>
	);
};
