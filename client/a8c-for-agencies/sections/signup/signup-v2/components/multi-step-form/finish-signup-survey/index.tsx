import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';

type Props = {
	onContinue: () => void;
	blueprintRequested: boolean;
};

const FinishSignupSurvey: React.FC< Props > = ( { onContinue, blueprintRequested } ) => {
	const translate = useTranslate();

	return (
		<Form
			title={ translate( 'Thank you!' ) }
			description={
				blueprintRequested
					? translate(
							'We have sent you an email with more details about the program and instructions for logging in. A member of our team will be reaching out to you soon with your custom blueprint; keep an eye out for an email from {{b}}partnerships@automattic.com{{/b}}.',
							{
								components: {
									b: <b />,
								},
							}
					  )
					: translate(
							'We have sent you an email with more details about the program and instructions for logging in.'
					  )
			}
		>
			<FormFooter>
				<Button variant="primary" onClick={ onContinue } __next40pxDefaultSize>
					{ translate( 'Close survey' ) }
				</Button>
			</FormFooter>
		</Form>
	);
};

export default FinishSignupSurvey;
