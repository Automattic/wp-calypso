import { HorizontalBarList, HorizontalBarListItem, StatsCard } from '@automattic/components';
import debugFactory from 'debug';
import page from 'page';
import React from 'react';
import titlecase from 'to-title-case';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import StatsListActions from './stats-list-actions';

const debug = debugFactory( 'calypso:stats:list:posts' );

const StatsListPosts = ( {
	data,
	moduleName,
	showMore,
	title,
	emptyMessage,
	titleURL,
	// error,
	loader,
	translate,
} ) => {
	// const [ activeGroups, setActiveGroup ] = useState( [] );
	const moduleNameTitle = titlecase( moduleName );

	// const isGroupActive = ( groupName ) => {
	// 	return activeGroups.indexOf( groupName ) >= 0;
	// };

	const localClickHandler = ( event, listItemData ) => {
		debug( 'clickHandler' );
		page( listItemData?.page );
		gaRecordEvent( 'Stats', ` Clicked ${ moduleNameTitle } Summary Link in List` );
	};

	const barMaxValue = data?.[ 0 ]?.value || 0;

	return (
		<StatsCard
			title={ title }
			footerAction={
				showMore
					? {
							url: showMore?.url,
							label: showMore?.label,
					  }
					: undefined
			}
			emptyMessage={ emptyMessage }
			isEmpty={ ! loader && ( ! data || ! data?.length ) }
			titleURL={ titleURL }
			className="list-posts-pages"
		>
			{ !! loader && loader }
			<HorizontalBarList data={ data }>
				{ data?.map( ( item ) => {
					return (
						<HorizontalBarListItem
							key={ item?.id }
							data={ item }
							maxValue={ barMaxValue }
							hasIndicator={ item?.className?.includes( 'published' ) }
							onClick={ ( e ) => localClickHandler( e, item ) }
							rightSideItem={
								<StatsListActions data={ item } translate={ translate } moduleName="posts" />
							}
						/>
					);
				} ) }
			</HorizontalBarList>
		</StatsCard>
	);
};

export default StatsListPosts;
