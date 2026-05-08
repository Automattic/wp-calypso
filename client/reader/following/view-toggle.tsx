import { Button, Tooltip } from '@wordpress/components';
import { drawerLeft, postContent, postList } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type ReaderFollowingView, useFollowingView } from './view-preference';

const DEFAULT_VISIBLE_VIEWS: ReaderFollowingView[] = [ 'recent', 'stream' ];

interface ViewToggleProps {
	views?: ReaderFollowingView[];
}

export default function ViewToggle( { views = DEFAULT_VISIBLE_VIEWS }: ViewToggleProps ) {
	const { currentView, setView } = useFollowingView();
	const translate = useTranslate();
	const pressedView = views.includes( currentView ) ? currentView : 'stream';
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
		<div className="following__view-toggle" role="group" aria-label={ translate( 'Reader view' ) }>
			{ viewOptions
				.filter( ( { view } ) => views.includes( view ) )
				.map( ( { view, icon, label } ) => {
					return (
						<Tooltip key={ view } text={ label }>
							<Button
								icon={ icon }
								isPressed={ pressedView === view }
								onClick={ () => setView( view ) }
								label={ label }
							/>
						</Tooltip>
					);
				} ) }
		</div>
	);
}
