// eslint-disable-next-line import/named
import { HorizontalBarList, HorizontalBarListItem, StatsCard } from '@automattic/components';
// import classNames from 'classnames';
import debugFactory from 'debug';
import page from 'page';
import React from 'react';
import titlecase from 'to-title-case';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
// import StatsListItem from './stats-list-item';

const debug = debugFactory( 'calypso:stats:list:posts' ); // what is this?

// TODO: check loaders
const StatsListPosts = ( {
	data,
	// clickHandler,
	moduleName,
	// childrenData,
	showMore,
	title,
	emptyMessage,
	titleURL,
	error,
	isLoading,
} ) => {
	// const [ activeGroups, setActiveGroup ] = useState( [] );
	const moduleNameTitle = titlecase( moduleName );

	// const isGroupActive = ( groupName ) => {
	// 	return activeGroups.indexOf( groupName ) >= 0;
	// };

	// TODO: port onClick from stats-list-item
	const localClickHandler = ( event, listItemData ) => {
		debug( 'clickHandler' );

		// this happens on post click
		page( listItemData?.page );

		gaRecordEvent( 'Stats', ` Clicked ${ moduleNameTitle } Summary Link in List` );
	};

	const barMaxValue = data?.[ 0 ]?.value || 0;

	return (
		<>
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
				isEmpty={ ! isLoading && ( ! data || ! data?.length ) }
				titleURL={ titleURL }
			>
				{ !! isLoading && isLoading }
				<HorizontalBarList className="list-posts-pages" data={ data }>
					{ data?.map( ( item ) => {
						return (
							<HorizontalBarListItem
								key={ item?.id }
								data={ item }
								maxValue={ barMaxValue }
								hasIndicator={ item?.className?.includes( 'published' ) }
								onClick={ ( e ) => localClickHandler( e, item ) }
								rightSideItem={ <div>abc</div> } // TODO: create link component and use type and url in `action` prop
							/>
						);
					} ) }
				</HorizontalBarList>
			</StatsCard>
		</>
	);
};

export default StatsListPosts;
