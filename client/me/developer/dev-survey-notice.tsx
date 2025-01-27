import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import surveyImage from 'calypso/assets/images/illustrations/developer-survey.svg';

type DeveloperSurveyNoticeProps = {
	onClose: ( remindTimeInSeconds: number, buttonName: string ) => void;
	onSurveyClick: () => void;
	localeSlug: string;
};

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
const ONE_YEAR_IN_SECONDS = 365 * ONE_DAY_IN_SECONDS;

export const DeveloperSurveyNotice = ( {
	onClose,
	onSurveyClick,
	localeSlug,
}: DeveloperSurveyNoticeProps ) => {
	const translate = useTranslate();
	const href =
		localeSlug === 'es'
			? 'https://wordpressdotcom.survey.fm/developer-survey-es'
			: 'https://wordpressdotcom.survey.fm/developer-survey';

	return (
		<div className="developer-survey-notice">
			<Button
				className="developer-survey-notice__backdrop"
				onClick={ () => onClose( ONE_DAY_IN_SECONDS, 'backdrop' ) }
			/>
			<div className="developer-survey-notice__popup">
				<div className="developer-survey-notice__popup-head">
					<div className="developer-survey-notice__popup-head-title">
						{ translate( 'Developer Survey' ) }
					</div>
					<Button
						onClick={ () => onClose( ONE_YEAR_IN_SECONDS, 'close-button' ) }
						className="developer-survey-notice__popup-head-close"
					>
						<Gridicon icon="cross" size={ 16 } />
					</Button>
				</div>
				<div className="developer-survey-notice__popup-img">
					<img src={ surveyImage } alt={ translate( 'Code editor' ) } />
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
							variant="tertiary"
							onClick={ () => onClose( ONE_DAY_IN_SECONDS, 'remind-later-button' ) }
						>
							{ translate( 'Maybe later' ) }
						</Button>
						<Button
							variant="primary"
							href={ href }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ onSurveyClick }
						>
							{ translate( 'Take survey' ) }
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
