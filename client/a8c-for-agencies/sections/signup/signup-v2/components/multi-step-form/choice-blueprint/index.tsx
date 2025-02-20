import { Button } from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

type Props = {
	onContinue: () => void;
	onSkip: () => void;
	goBack: () => void;
};

const ChoiceBlueprint: React.FC< Props > = ( { onContinue, onSkip, goBack } ) => {
	const translate = useTranslate();

	return (
		<Form
			className="choice-blueprint-form"
			title={ preventWidows(
				translate( 'Grow your business with a free personalized blueprint' )
			) }
		>
			<div className="choice-blueprint__content">
				<p>
					{ translate(
						"Answer a few questions about your agency's goals for the year, and you'll receive a custom program blueprint tailored to your unique objectives. The guide will include:"
					) }
				</p>
				<ul className="choice-blueprint__content-list">
					<li>
						{ translate(
							"Partner strategies that are specifically aligned with your agency's goals to help you achieve them more efficiently through the Automattic for Agencies Program."
						) }
					</li>
					<li>
						{ translate(
							'Recommendations for Automattic products and agency tools that will streamline your operations, boosting productivity and client satisfaction.'
						) }
					</li>
					<li>
						{ translate(
							'Revenue growth opportunities tailored to your current product usage, only through the Automattic for Agencies Program.'
						) }
					</li>
				</ul>

				<p>{ translate( 'The survey will take less than a minute.' ) }</p>
			</div>
			<FormFooter>
				<Button
					className="signup-multi-step-form__back-button"
					variant="tertiary"
					onClick={ goBack }
					icon={ arrowLeft }
					iconSize={ 18 }
				>
					{ translate( 'Back' ) }
				</Button>

				<div>
					<Button
						className="choice-blueprint__cancel-button"
						variant="tertiary"
						onClick={ onSkip }
						__next40pxDefaultSize
					>
						{ translate( 'Skip and finish' ) }
					</Button>
					<Button
						className="choice-blueprint__button"
						variant="primary"
						onClick={ onContinue }
						__next40pxDefaultSize
					>
						{ translate( 'Take me to the survey' ) }
					</Button>
				</div>
			</FormFooter>
		</Form>
	);
};

export default ChoiceBlueprint;
