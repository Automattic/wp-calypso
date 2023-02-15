import {
	HorizontalBarList,
	HorizontalBarListItem,
	StatsCard,
	StatsCardAvatar,
} from '@automattic/components';
import classNames from 'classnames';
import debugFactory from 'debug';
import page from 'page';
import React, { useState, useCallback } from 'react';
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
	loader,
	useShortLabel,
	useShortNumber,
	error,
	heroElement,
	metricLabel,
	splitHeader,
	mainItemLabel,
	additionalColumns,
	toggleControl,
	className,
} ) => {
	const moduleNameTitle = titlecase( moduleType );
	const debug = debugFactory( `calypso:stats:list:${ moduleType }` );
	const [ visibleRightItemKey, setVisibleRightItemKey ] = useState( undefined );

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

	const toggleMobileMenu = useCallback( ( event, isVisible, key ) => {
		event.stopPropagation();
		event.preventDefault();

		if ( isVisible ) {
			setVisibleRightItemKey( undefined );
		} else {
			setVisibleRightItemKey( key );
		}
	}, [] );

	const outputRightItem = ( item, key ) => {
		const isVisible = key === visibleRightItemKey;

		return (
			<StatsListActions
				data={ item }
				moduleName={ moduleType }
				isMobileMenuVisible={ isVisible }
				inStatsListCard
				onMobileMenuClick={ ( event ) => toggleMobileMenu( event, isVisible, key ) }
			>
				{ item?.link && (
					<OpenLink href={ item.link } key={ `link-${ key }` } moduleName={ moduleType } />
				) }
			</StatsListActions>
		);
	};

	// Search doesn't have items sorted by value when there are 'Unknown search terms' present.
	const barMaxValue = data?.length
		? Math.max( ...data.map( ( item ) => item?.value || 0 ).filter( Number.isFinite ) )
		: 0;

	let sortedData = data;

	// Include 'Unknown search terms' at a proper place according to its value.
	if ( moduleType === 'searchterms' ) {
		sortedData = data?.sort( ( a, b ) => b.value - a.value );
	}

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
			className={ classNames( `list-${ moduleType }`, className ) }
			metricLabel={ metricLabel }
			heroElement={ heroElement }
			splitHeader={ splitHeader }
			mainItemLabel={ mainItemLabel }
			additionalHeaderColumns={ additionalColumns?.header }
			toggleControl={ toggleControl }
		>
			{ !! loader && loader }
			{ !! error && error }
			{ ! loader && (
				<HorizontalBarList>
					{ sortedData?.map( ( item, index ) => {
						let leftSideItem;
						const isInteractive = item?.link || item?.page || item?.children;
						const key = item?.id || index; // not every item has an id

						// left icon visible only for Author avatars and Contry flags.
						if ( item?.countryCode ) {
							leftSideItem = <StatsListCountryFlag countryCode={ item.countryCode } />;
						} else if ( ( moduleType === 'authors' || moduleType === 'comments' ) && item?.icon ) {
							leftSideItem = <StatsCardAvatar url={ item?.icon } altName={ item?.label } />;
						}

						return (
							<HorizontalBarListItem
								key={ key }
								data={ item }
								maxValue={ barMaxValue }
								hasIndicator={ item?.className?.includes( 'published' ) }
								onClick={ localClickHandler }
								leftSideItem={ leftSideItem }
								renderRightSideItem={ ( incomingItem ) => outputRightItem( incomingItem, key ) }
								useShortLabel={ useShortLabel }
								useShortNumber={ useShortNumber }
								isStatic={ ! isInteractive }
								barMaxValue={ barMaxValue }
								additionalColumns={ additionalColumns?.body( item ) }
							/>
						);
					} ) }
				</HorizontalBarList>
			) }
		</StatsCard>
	);
};

export default StatsListCard;
