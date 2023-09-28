import Main from 'calypso/components/main';
import CheckoutMasterbar from './sections/CheckoutMasterbar';

import './style.scss';

interface ThankYouLayoutContainerProps {
	children: React.ReactNode;
}

const ThankYouLayout: React.FC< ThankYouLayoutContainerProps > = ( { children } ) => {
	return (
		<Main className="is-redesign-v2">
			<CheckoutMasterbar />
			{ children }
		</Main>
	);
};

export default ThankYouLayout;
