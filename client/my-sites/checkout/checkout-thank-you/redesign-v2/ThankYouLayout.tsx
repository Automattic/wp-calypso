<<<<<<< HEAD
=======
import { ConfettiAnimation } from '@automattic/components';
>>>>>>> 588351b433 (Update domain transfer init succeed congrats page)
import Main from 'calypso/components/main';
import CheckoutMasterbar from './sections/CheckoutMasterbar';

import './style.scss';

interface ThankYouLayoutContainerProps {
	children: React.ReactNode;
}

const ThankYouLayout: React.FC< ThankYouLayoutContainerProps > = ( { children } ) => {
	return (
		<Main className="is-redesign-v2">
<<<<<<< HEAD
=======
			<ConfettiAnimation />
>>>>>>> 588351b433 (Update domain transfer init succeed congrats page)
			<CheckoutMasterbar />
			{ children }
		</Main>
	);
};

export default ThankYouLayout;
