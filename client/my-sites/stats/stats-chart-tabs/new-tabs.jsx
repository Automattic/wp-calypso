import { HighlightCards } from '@automattic/components/src/highlight-cards/weekly-highlight-cards';

export default function NewStatsTabs( { data, tabs, switchTab, selectedTab, previousData } ) {
	const activeData = {};
	data.map( ( day ) =>
		tabs.map( ( tab ) => {
			if ( isFinite( day[ tab.attr ] ) ) {
				if ( ! ( tab.attr in activeData ) ) {
					activeData[ tab.attr ] = 0;
				}
				activeData[ tab.attr ] = activeData[ tab.attr ] + day[ tab.attr ];
			}
		} )
	);

	return (
		<HighlightCards
			counts={ { activeData } }
			previousCounts={ previousData }
			onClickViews={ () => switchTab( 'views' ) }
			onClickVisitors={ () => switchTab( 'visits' ) }
			onClickLikes={ () => switchTab( 'likes' ) }
			onClickComments={ () => switchTab( 'comments' ) }
			selectedCard={ selectedTab }
		/>
	);
}
