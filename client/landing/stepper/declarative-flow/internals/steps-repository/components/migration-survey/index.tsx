import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import surveyImage from 'calypso/assets/images/onboarding/migrations/survey/wordpress-half-logo.png';
import { Survey, SurveyTriggerAccept, SurveyTriggerSkip } from '../survey';
import './style.scss';

const linkByCountry = {
	IN: 'https://automattic.survey.fm/wp-com-migration-survey-wtp-india-focused',
	US: 'https://automattic.survey.fm/wp-com-migration-survey-wtp-us-focused',
};

type Countries = keyof typeof linkByCountry;

type MigrationSurveyProps = {
	countryCode: string;
};

const getLink = ( country: Countries ) => {
	return linkByCountry[ country ];
};

const MigrationSurvey = ( { countryCode }: MigrationSurveyProps ) => {
	const surveyLink = getLink( countryCode as Countries );

	return (
		<Survey
			name="migration-survey"
			className="migration-survey"
			title={ translate( 'Migration Survey' ) }
		>
			<div className="migration-survey__popup-img">
				<img src={ surveyImage } alt={ translate( 'Code editor' ) } width={ 436 } height={ 249 } />
			</div>
			<div className="migration-survey__popup-content">
				<h3 className="migration-survey__popup-content-title">
					{ translate( 'Shape the Future of WordPress.com' ) }
				</h3>
				<div className="migration-survey__popup-content-description">
					{ translate(
						'Got a minute? Tell us about your WordPress.com journey in our brief survey and help us serve you better.'
					) }
				</div>
				<div className="migration-survey__popup-content-buttons">
					<SurveyTriggerSkip asChild>
						<Button className="migration-survey__popup-content-buttons-cancel">
							{ translate( 'Maybe later' ) }
						</Button>
					</SurveyTriggerSkip>
					<SurveyTriggerAccept asChild>
						<Button variant="primary" target="_blank" href={ surveyLink }>
							{ translate( 'Take survey' ) }
						</Button>
					</SurveyTriggerAccept>
				</div>
			</div>
		</Survey>
	);
};

export default MigrationSurvey;
