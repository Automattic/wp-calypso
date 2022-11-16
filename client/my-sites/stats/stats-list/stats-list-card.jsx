import {
	HorizontalBarList,
	HorizontalBarListItem,
	StatsCard,
	// eslint-disable-next-line import/named
	StatsCardAvatar,
} from '@automattic/components';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import titlecase from 'to-title-case';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import OpenLink from './action-link';
import StatsListActions from './stats-list-actions';
import StatsListCountryFlag from './stats-list-country-flag';

const StatsListCard = ( {
	data,
	moduleType,
	showMore,
	title,
	emptyMessage,
	titleURL,
	loader,
	useShortLabel,
	error,
	heroElement,
} ) => {
	const translate = useTranslate();
	const moduleNameTitle = titlecase( moduleType );
	const debug = debugFactory( `calypso:stats:list:${ moduleType }` );

	const localClickHandler = ( event, listItemData ) => {
		debug( 'clickHandler' );

		if ( listItemData?.page ) {
			gaRecordEvent( 'Stats', ` Clicked ${ moduleNameTitle } Summary Link in List` );
			page( listItemData.page );
		} else if ( listItemData?.link ) {
			// downloads component and some old search items (not all)
			gaRecordEvent( 'Stats', ` Clicked ${ moduleNameTitle } External Link in List` );

			window.open( listItemData?.link );
		}
	};

	const outputRightItem = ( item, index ) => {
		return (
			<StatsListActions data={ item } moduleName={ moduleType } inStatsListCard>
				{ item?.link && (
					<OpenLink href={ item.link } key={ `link-${ index }` } moduleName={ moduleType } />
				) }
			</StatsListActions>
		);
	};

	// Search doesn't have items sorted by value when there are 'Unknown search terms' present.
	const barMaxValue = data?.length
		? Math.max( ...data.map( ( item ) => item?.value || 0 ).filter( Number.isFinite ) )
		: 0;

	return (
		<StatsCard
			title={ title }
			titleURL={ titleURL }
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
			className={ `list-${ moduleType }` }
			metricLabel={ moduleType === 'filedownloads' ? translate( 'Downloads' ) : undefined }
			heroElement={ heroElement }
		>
			{ !! loader && loader }
			{ !! error && error }
			<HorizontalBarList>
				{ data?.map( ( item, index ) => {
					let leftSideItem;
					const isInteractive = item?.link || item?.page || item?.children;

					// left icon visible only for Author avatars and Contry flags.
					if ( item?.countryCode ) {
						leftSideItem = <StatsListCountryFlag countryCode={ item.countryCode } />;
					} else if ( moduleType === 'authors' && item?.icon ) {
						leftSideItem = <StatsCardAvatar url={ item?.icon } altName={ item?.label } />;
					}

					return (
						<HorizontalBarListItem
							key={ item?.id || index } // not every item has an id
							data={ item }
							maxValue={ barMaxValue }
							hasIndicator={ item?.className?.includes( 'published' ) }
							onClick={ localClickHandler }
							leftSideItem={ leftSideItem }
							renderRightSideItem={ ( incomingItem ) => outputRightItem( incomingItem, index ) }
							useShortLabel={ useShortLabel }
							isStatic={ ! isInteractive }
							barMaxValue={ barMaxValue }
						/>
					);
				} ) }
			</HorizontalBarList>
		</StatsCard>
	);
};

export default StatsListCard;
