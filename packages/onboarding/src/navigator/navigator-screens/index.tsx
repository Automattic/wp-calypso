import {
	__experimentalHStack as HStack,
	__experimentalNavigatorScreen as NavigatorScreen,
} from '@wordpress/components';
import { NavigationButtonAsItem } from '../navigator-buttons';

type Screen = {
	checked?: boolean;
	icon?: JSX.Element;
	label: string;
	path: string;
	content: JSX.Element;
	onSelect?: () => void;
};

interface Props {
	screens: Screen[];
	initialPath?: string;
}

const NavigatorScreens = ( { screens, initialPath = '/' }: Props ) => {
	if ( screens.length === 1 ) {
		return <>{ screens.map( ( screen ) => screen.content ) }</>;
	}

	return (
		<>
			<NavigatorScreen path={ initialPath }>
				<HStack direction="column" alignment="top" spacing="4">
					{ screens.map( ( { checked, icon, label, path, onSelect } ) => (
						<NavigationButtonAsItem
							checked={ checked }
							icon={ icon }
							path={ path }
							aria-label={ label }
							onClick={ onSelect }
						>
							{ label }
						</NavigationButtonAsItem>
					) ) }
				</HStack>
			</NavigatorScreen>
			{ screens.map( ( { path, content } ) => (
				<NavigatorScreen path={ path }>{ content }</NavigatorScreen>
			) ) }
		</>
	);
};

export default NavigatorScreens;
