import { Button, Tooltip } from '@wordpress/components';
import { drawerLeft, postContent, postList } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ReaderFollowingView, useFollowingView } from './view-preference';

export default function ViewToggle() {
	const { currentView, setView } = useFollowingView();
	const translate = useTranslate();
	const viewOptions: Array< {
		view: ReaderFollowingView;
		icon: JSX.Element;
		label: string;
	} > = [
		{
			view: 'recent',
			icon: drawerLeft,
			label: translate( 'Full post' ),
		},
		{
			view: 'full-feed',
			icon: postContent,
			label: translate( 'Full feed' ),
		},
		{
			view: 'stream',
			icon: postList,
			label: translate( 'Scrolling feed' ),
		},
	];

	return (
		<div className="following__view-toggle">
			{ viewOptions.map( ( { view, icon, label } ) => {
				return (
					<Tooltip key={ view } text={ label }>
						<Button
							icon={ icon }
							isPressed={ currentView === view }
							onClick={ () => setView( view ) }
							label={ label }
						/>
					</Tooltip>
				);
			} ) }
		</div>
	);
}
