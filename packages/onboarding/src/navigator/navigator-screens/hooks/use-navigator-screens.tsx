import { Button } from '@automattic/components';
import {
	__experimentalNavigatorBackButton as NavigatorBackButton,
	__experimentalNavigatorScreen as NavigatorScreen,
} from '@wordpress/components';
import NavigatorHeader from '../../navigator-header';
import type { NavigatorScreenObject } from '../types';

const useNavigatorScreens = ( screens: NavigatorScreenObject[] ) => {
	return screens.map(
		( { path, label, title, description, hideBack, content, actionText, onSubmit, onBack } ) => (
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
	);
};

export default useNavigatorScreens;
