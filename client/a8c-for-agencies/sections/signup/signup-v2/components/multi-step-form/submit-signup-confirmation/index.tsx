import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';

import './style.scss';

type Props = {
	onContinue: () => void;
};

const SubmitSignupConfirmation: React.FC< Props > = ( { onContinue } ) => {
	const translate = useTranslate();
	const [ isLoading, setIsLoading ] = useState( false );

	const onHandleContinue = () => {
		setIsLoading( true );
		onContinue();
	};

	return (
		<Form
			className="submit-signup-confirmation"
			title={ translate( 'Complete your setup!' ) }
			description={ translate( 'One last step, just login!' ) }
		>
			<span className="submit-signup-confirmation__description">
				{ translate(
					"We'll link your WordPress.com account to your agency dashboard. If you don't have an account you can create one on the next screen."
				) }
			</span>

			<Button
				variant="primary"
				onClick={ onHandleContinue }
				__next40pxDefaultSize
				isBusy={ isLoading }
			>
				{ translate( 'Finish and login with WordPress.com' ) }
			</Button>
		</Form>
	);
};

export default SubmitSignupConfirmation;
