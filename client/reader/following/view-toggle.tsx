import { Button, Tooltip } from '@wordpress/components';
import { pullquote, drawerLeft } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { useFollowingView } from './view-preference';

export default function ViewToggle() {
	const { currentView, setView } = useFollowingView();

	return (
		<div className="following__view-toggle">
			<Tooltip text={ translate( 'Full post' ) }>
				<Button
					icon={ drawerLeft }
					isPressed={ currentView === 'recent' }
					onClick={ () => setView( 'recent' ) }
					label={ translate( 'Full post' ) }
				/>
			</Tooltip>
			<Tooltip text={ translate( 'Scrolling feed' ) }>
				<Button
					icon={ pullquote }
					isPressed={ currentView === 'stream' }
					onClick={ () => setView( 'stream' ) }
					label={ translate( 'Scrolling feed' ) }
				/>
			</Tooltip>
		</div>
	);
}
