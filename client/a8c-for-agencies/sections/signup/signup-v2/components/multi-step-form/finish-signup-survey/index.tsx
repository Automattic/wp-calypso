import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';

type Props = {
	onContinue: () => void;
};

const FinishSignupSurvey: React.FC< Props > = ( { onContinue } ) => {
	const translate = useTranslate();

	return (
		<Form
			title={ translate( 'Thank you!' ) }
			description={ translate(
				'We have sent you an email with more details about the program and instructions for logging in. You will also receive your blueprint in the coming days; keep an eye out for it!'
			) }
		>
			<div>
				<Button variant="primary" onClick={ onContinue }>
					{ translate( 'Close survey' ) }
				</Button>
			</div>
		</Form>
	);
};

export default FinishSignupSurvey;
