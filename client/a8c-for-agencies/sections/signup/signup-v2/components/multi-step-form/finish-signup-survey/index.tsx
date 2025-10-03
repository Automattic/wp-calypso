import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import FinishSignupSurveyPlaceHolder from './placeholder';

import './style.scss';

type Props = {
	onContinue: () => void;
	isPending?: boolean;
};

const FinishSignupSurvey: React.FC< Props > = ( { onContinue, isPending } ) => {
	const translate = useTranslate();

	if ( isPending ) {
		return <FinishSignupSurveyPlaceHolder />;
	}

	return (
		<Form
			className="signup-finish-survey"
			title={ translate( 'Welcome to Automattic for Agencies!' ) }
		>
			<div className="signup-finish-survey__content">
				<p>
					{ translate( '{{b}}Last step:{{/b}} Check your email for a magic link to log in.', {
						components: {
							b: <b />,
						},
					} ) }
				</p>

				<p>
					{ translate(
						"You're just moments away from exclusive benefits, revenue opportunities, and more streamlined workflows that will build trust with your clients."
					) }
				</p>

				<p>
					{ translate(
						"Automattic for Agencies is more than a site management tool—we're your partner in growing your WordPress agency."
					) }
				</p>
			</div>

			<FormFooter>
				<Button variant="primary" onClick={ onContinue } __next40pxDefaultSize>
					{ translate( 'Return home' ) }
				</Button>
			</FormFooter>
		</Form>
	);
};

export default FinishSignupSurvey;
