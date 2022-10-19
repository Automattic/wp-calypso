// eslint-disable-next-line import/named
import { HorizontalBarList, HorizontalBarListItem } from '@automattic/components'; // why is pre-commit complaining only about this...
// import classNames from 'classnames';
// import debugFactory from 'debug';
import page from 'page';
import React from 'react';
import titlecase from 'to-title-case';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

// import './style.scss';

// const debug = debugFactory( 'calypso:stats:list:posts' ); // what is this?

const StatsListPosts = ( { data, moduleName } ) => {
	// const [ activeGroups, setActiveGroup ] = useState( [] );
	const moduleNameTitle = titlecase( moduleName );

	// const isGroupActive = ( groupName ) => {
	// 	return activeGroups.indexOf( groupName ) >= 0;
	// };

	const localClickHandler = ( event, listItemData ) => {
		// debug( 'clickHandler' );

		// this happens on post click
		page( listItemData?.page );

		gaRecordEvent( 'Stats', ` Clicked ${ moduleNameTitle } Summary Link in List` );

		// looks like stats-list-item was never getting its clickHandler despite the declaration... consider removing
		// if ( 'function' === typeof clickHandler ) {
		// 	clickHandler( event, data );
		// }
	};

	const barMaxValue = data?.[ 0 ]?.value || 0;

	return (
		<HorizontalBarList className="list-posts-pages" data={ data }>
			{ data?.map( ( item ) => {
				return (
					<HorizontalBarListItem
						key={ item?.id }
						data={ item }
						maxValue={ barMaxValue }
						hasIndicator={ item?.className?.includes( 'published' ) }
						onClick={ ( e ) => localClickHandler( e, item ) }
					/>
				);
			} ) }
		</HorizontalBarList>
	);
};

export default StatsListPosts;
