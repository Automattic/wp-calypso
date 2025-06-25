import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
	useNavigator,
} from '@wordpress/components';
import { Navigator } from '@wordpress/components/build-types/navigator/types';
import { MutableRefObject } from 'react';
import NavigatorListener from '../navigator-listener';
import { useNavigatorScreens } from './hooks';
import type { NavigatorScreenObject } from './types';
import './navigator-screens.scss';

const NavigatorRefSetter = ( {
	navigatorRef,
}: {
	navigatorRef: MutableRefObject< Navigator | null >;
} ) => {
	const navigator = useNavigator();
	navigatorRef.current = navigator;

	return null;
};

interface Props {
	children: JSX.Element;
	screens: NavigatorScreenObject[];
	initialPath?: string;
	navigatorRef: MutableRefObject< Navigator | null >;
	onNavigatorPathChange?: ( path?: string ) => void;
}

const NavigatorScreens = ( {
	children,
	screens,
	initialPath = '/',
	navigatorRef,
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
			<NavigatorRefSetter navigatorRef={ navigatorRef } />
			{ onNavigatorPathChange && (
				<NavigatorListener onNavigatorPathChange={ onNavigatorPathChange } />
			) }
		</NavigatorProvider>
	);
};

export default NavigatorScreens;
