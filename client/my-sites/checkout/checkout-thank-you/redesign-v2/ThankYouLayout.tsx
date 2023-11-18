import Main from 'calypso/components/main';
import CheckoutMasterbar, { CheckoutMasterbarProps } from './sections/CheckoutMasterbar';

import './style.scss';

interface ThankYouLayoutContainerProps {
	children: React.ReactNode;
	masterbarProps: CheckoutMasterbarProps;
}

const ThankYouLayout: React.FC< ThankYouLayoutContainerProps > = ( {
	children,
	masterbarProps,
} ) => {
	return (
		<Main className="is-redesign-v2">
			<CheckoutMasterbar { ...masterbarProps } />
			{ children }
		</Main>
	);
};

export default ThankYouLayout;
