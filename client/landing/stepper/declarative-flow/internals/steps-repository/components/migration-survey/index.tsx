import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import surveyImage from 'calypso/assets/images/illustrations/developer-survey.svg';
import { Survey, SurveyProps, SurveyTriggerAccept, SurveyTriggerSkip } from '../survey';
import './style.scss';

type MigrationSurveyProps = Pick< SurveyProps, 'isOpen' >;

const MigrationSurvey = ( { isOpen }: MigrationSurveyProps ) => {
	return (
		<Survey
			name="migration-survey"
			className="migration-survey"
			title={ translate( 'Hey developer!' ) }
			isOpen={ isOpen }
		>
			<div className="migration-survey__popup-img">
				<img src={ surveyImage } alt={ translate( 'Code editor' ) } />
			</div>
			<div className="migration-survey__popup-content">
				<h3 className="migration-survey__popup-content-title">{ translate( 'Hey developer!' ) }</h3>
				<div className="migration-survey__popup-content-description">
					{ translate(
						"How do you use WordPress.com? Spare a moment? We'd love to hear what you think in a quick survey."
					) }
				</div>
				<div className="migration-survey__popup-content-buttons">
					<SurveyTriggerSkip asChild>
						<Button className="migration-survey__popup-content-buttons-cancel">
							{ translate( 'Maybe later' ) }
						</Button>
					</SurveyTriggerSkip>
					<SurveyTriggerAccept asChild>
						<Button variant="primary">{ translate( 'Take survey' ) }</Button>
					</SurveyTriggerAccept>
				</div>
			</div>
		</Survey>
	);
};

export default MigrationSurvey;
