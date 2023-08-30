import { useNavigatorListener, OnNavigatorPathChange } from '../hooks';

interface Props {
	onNavigatorPathChange?: OnNavigatorPathChange;
}

const NavigatorListener = ( { onNavigatorPathChange }: Props ) => {
	useNavigatorListener( onNavigatorPathChange );
	return null;
};

export default NavigatorListener;
