import { Button } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalNavigatorBackButton as NavigatorBackButton,
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
} from '@wordpress/components';
import { NavigationButtonAsItem } from '../navigator-buttons';
import NavigatorHeader from '../navigator-header';
import type { NavigatorScreenObject } from '../types';
import type { ComponentType } from 'react';

interface Props {
	screens: NavigatorScreenObject[];
	InitialScreen: ComponentType< { children: JSX.Element } >;
	initialPath?: string;
}

const NavigatorScreens = ( { screens, InitialScreen, initialPath = '/' }: Props ) => {
	if ( screens.length === 0 ) {
		return null;
	}

	if ( screens.length === 1 ) {
		return <InitialScreen>{ screens[ 0 ].content }</InitialScreen>;
	}

	return (
		<NavigatorProvider initialPath={ initialPath }>
			<NavigatorScreen path={ initialPath }>
				<InitialScreen>
					<HStack direction="column" alignment="top" spacing="4">
						{ screens.map( ( { checked, icon, label, path, onSelect } ) => (
							<NavigationButtonAsItem
								key={ path }
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
				</InitialScreen>
			</NavigatorScreen>
			{ screens.map(
				( {
					path,
					label,
					title,
					description,
					hideBack,
					content,
					actionText,
					onSubmit,
					onBack,
				} ) => (
					<NavigatorScreen key={ path } path={ path }>
						<>
							<NavigatorHeader
								title={ <>{ title ?? label }</> }
								description={ description }
								hideBack={ hideBack }
								onBack={ onBack }
							/>
							{ content }
							<div className="navigator-screen__footer">
								<NavigatorBackButton as={ Button } primary onClick={ onSubmit }>
									{ actionText }
								</NavigatorBackButton>
							</div>
						</>
					</NavigatorScreen>
				)
			) }
		</NavigatorProvider>
	);
};

export default NavigatorScreens;
