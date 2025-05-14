import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';

import './style.scss';

type Props = {
	onContinue: () => void;
};

const SubmitSignupConfirmation: React.FC< Props > = ( { onContinue } ) => {
	const translate = useTranslate();

	return (
		<Form
			className="submit-signup-confirmation"
			title={ translate( 'Complete your setup!' ) }
			description={ translate( 'One last step, just login!' ) }
		>
			<Button variant="primary" onClick={ onContinue } __next40pxDefaultSize>
				{ translate( 'Finish and login with WordPress.com' ) }
			</Button>

			<span className="submit-signup-confirmation__description">
				{ translate(
					"We'll link your WordPress.com account to your agency dashboard. If you don't have an account you can create one on the next screen."
				) }
			</span>
		</Form>
	);
};

export default SubmitSignupConfirmation;
