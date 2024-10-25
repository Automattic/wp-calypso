import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import surveyImage from 'calypso/assets/images/onboarding/migrations/survey/wordpress-half-logo.png';
import { Survey, SurveyProps, SurveyTriggerAccept, SurveyTriggerSkip } from '../survey';
import './style.scss';

type MigrationSurveyProps = Pick< SurveyProps, 'isOpen' >;

const MigrationSurvey = ( { isOpen }: MigrationSurveyProps ) => {
	return (
		<Survey
			name="migration-survey"
			className="migration-survey"
			title={ translate( 'Migration Survey' ) }
			isOpen={ isOpen }
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
						<Button
							variant="primary"
							target="_blank"
							href="https://automattic.survey.fm/wp-com-migration-survey"
						>
							{ translate( 'Take survey' ) }
						</Button>
					</SurveyTriggerAccept>
				</div>
			</div>
		</Survey>
	);
};

export default MigrationSurvey;
