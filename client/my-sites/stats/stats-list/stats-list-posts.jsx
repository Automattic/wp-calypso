import {
	// eslint-disable-next-line import/named
	HorizontalBarList,
	// eslint-disable-next-line import/named
	HorizontalBarListItem,
	// eslint-disable-next-line import/named
	StatsCard,
	Gridicon,
} from '@automattic/components';
// import classNames from 'classnames';
import debugFactory from 'debug';
import page from 'page';
import React from 'react';
import titlecase from 'to-title-case';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
// import StatsListItem from './stats-list-item';

const debug = debugFactory( 'calypso:stats:list:posts' ); // what is this?

// TODO: move to a new component
const LinkNode = ( { href, moduleName, translate } ) => {
	const onClick = ( event ) => {
		event.stopPropagation();
		gaRecordEvent( 'Stats', 'Clicked on External Link in ' + moduleName + ' List Action Menu' );
	};

	return (
		<a
			href={ href }
			onClick={ onClick }
			target="_blank"
			rel="noopener noreferrer"
			className="stats-list__item-action-wrapper module-content-list-item-action-wrapper"
			title={ translate( 'View content in a new window', {
				textOnly: true,
				context: 'Stats action tooltip: View content in a new window',
			} ) }
			aria-label={ translate( 'View content in a new window', {
				textOnly: true,
				context: 'Stats ARIA label: View content in new window action',
			} ) }
		>
			<Gridicon icon="external" size={ 18 } />
			<span className="stats-list__item-action-label module-content-list-item-action-label module-content-list-item-action-label-view">
				{ translate( 'View', { context: 'Stats: List item action to view content' } ) }
			</span>
		</a>
	);
};

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
	// error,
	isLoading,
	translate,
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
								rightSideItem={
									item?.actions?.length &&
									item.actions.map( ( action ) =>
										action?.type === 'link' ? (
											<LinkNode
												href={ action.data }
												key={ `posts-${ item?.id }-${ action.type }` }
												moduleName="posts"
												translate={ translate }
											/>
										) : undefined
									)
								}
							/>
						);
					} ) }
				</HorizontalBarList>
			</StatsCard>
		</>
	);
};

// TODO: add localize
export default StatsListPosts;
