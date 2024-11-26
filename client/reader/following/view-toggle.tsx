import { Button, Tooltip } from '@wordpress/components';
import { pullquote, drawerLeft } from '@wordpress/icons';
import { useFollowingView } from './view-preference';

export default function ViewToggle() {
	const { currentView, setView } = useFollowingView();

	return (
		<div className="following__view-toggle">
			<Tooltip text="Full post">
				<Button
					icon={ drawerLeft }
					isPressed={ currentView === 'recent' }
					onClick={ () => setView( 'recent' ) }
					label="Recent view"
				/>
			</Tooltip>
			<Tooltip text="Scrolling feed">
				<Button
					icon={ pullquote }
					isPressed={ currentView === 'stream' }
					onClick={ () => setView( 'stream' ) }
					label="Stream view"
				/>
			</Tooltip>
		</div>
	);
}
