import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
} from '@wordpress/components';
import NavigatorListener from '../navigator-listener';
import { useNavigatorScreens } from './hooks';
import type { NavigatorScreenObject } from './types';
import './navigator-screens.scss';

interface Props {
	children: JSX.Element;
	screens: NavigatorScreenObject[];
	initialPath?: string;
	onNavigatorPathChange?: ( path?: string ) => void;
}

const NavigatorScreens = ( {
	children,
	screens,
	initialPath = '/',
	onNavigatorPathChange,
}: Props ) => {
	const navigatorScreens = useNavigatorScreens( screens );

	// We don't need navigator if there is only one screen
	if ( screens.length === 1 ) {
		return children;
	}

	return (
		<NavigatorProvider initialPath={ initialPath }>
			<NavigatorScreen path={ initialPath }>{ children }</NavigatorScreen>
			{ navigatorScreens }
			{ onNavigatorPathChange && (
				<NavigatorListener onNavigatorPathChange={ onNavigatorPathChange } />
			) }
		</NavigatorProvider>
	);
};

export default NavigatorScreens;
