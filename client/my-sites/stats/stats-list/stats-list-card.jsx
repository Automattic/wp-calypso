import page from '@automattic/calypso-router';
import {
	HorizontalBarList,
	HorizontalBarListItem,
	StatsCard,
	StatsCardAvatar,
} from '@automattic/components';
import { Icon, tag, file } from '@wordpress/icons';
import clsx from 'clsx';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { useState, useCallback } from 'react';
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
	titleNodes,
	emptyMessage,
	loader,
	useShortLabel,
	useShortNumber,
	error,
	heroElement, // a node placed before the list
	metricLabel, // a label to use for the values on the right side of the bars - `Views` by default
	splitHeader, // instead of using a simple header containing the name of the card use additional columns and header items
	mainItemLabel,
	additionalColumns, // additional columns to be displayed next to the default `views` column
	toggleControl, // component to be placed in a split header
	className,
	usePlainCard,
	showLeftIcon,
	isLinkUnderlined,
	listItemClassName,
	overlay, // an overlay used to hide the module behind a blur overlay
	hasNoBackground,
	formatValue,
	onShowMoreClick,
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

	const generateRightItem = ( item, key ) => {
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

	const getLabelIcon = ( labelIconType ) => {
		if ( labelIconType === 'folder' ) {
			return <Icon className="stats-icon" icon={ file } size={ 22 } />;
		} else if ( labelIconType === 'tag' ) {
			return <Icon className="stats-icon" icon={ tag } size={ 22 } />;
		}
	};

	const generateLeftItem = ( item ) => {
		let leftSideItem; // undefined value avoids rendering an empty node if nothing generates the output

		// left icon visible for avatars, contry flags or tags and categories.
		if ( item?.countryCode ) {
			leftSideItem = <StatsListCountryFlag countryCode={ item.countryCode } />;
		} else if ( showLeftIcon && item?.icon ) {
			leftSideItem = <StatsCardAvatar url={ item?.icon } altName={ item?.label } />;
		} else if ( Array.isArray( item?.label ) ) {
			// tags without children have one item in its label array;
			// tags with children have them duplicated in this label array - chevron is added and label is constructed by concatenating items.
			if ( item?.label?.length === 1 ) {
				leftSideItem = getLabelIcon( item.label[ 0 ]?.labelIcon );
			}
			// else {} -> either unsupported icon or and an error with labels
		} else if ( item?.labelIcon ) {
			leftSideItem = getLabelIcon( item.labelIcon );
		}

		return leftSideItem;
	};

	// Search doesn't have items sorted by value when there are 'Unknown search terms' present.
	const barMaxValue = data?.length
		? Math.max( ...data.map( ( item ) => item?.value || 0 ).filter( Number.isFinite ) )
		: 0;

	return (
		<StatsCard
			title={ title }
			footerAction={
				showMore
					? {
							url: showMore?.url,
							label: showMore?.label,
							onClick: onShowMoreClick || undefined,
					  }
					: undefined
			}
			emptyMessage={ emptyMessage }
			isEmpty={ ! loader && ( ! data || ! data?.length ) }
			titleNodes={ titleNodes }
			className={ clsx( `list-${ moduleType }`, className ) }
			headerClassName={ listItemClassName }
			metricLabel={ metricLabel }
			heroElement={ heroElement }
			splitHeader={ splitHeader }
			mainItemLabel={ mainItemLabel }
			additionalHeaderColumns={ additionalColumns?.header }
			toggleControl={ toggleControl }
			overlay={ overlay }
		>
			{ !! loader && loader }
			{ !! error && error }
			{ ! loader && (
				<HorizontalBarList>
					{ data?.map( ( item, index ) => {
						const leftSideItem = generateLeftItem( item );
						const isInteractive = item?.link || item?.page || item?.children;
						const key = item?.id ?? index; // not every item has an id

						return (
							<HorizontalBarListItem
								key={ key }
								data={ item }
								className={ listItemClassName }
								maxValue={ barMaxValue }
								hasIndicator={ item?.className?.includes( 'published' ) }
								onClick={ localClickHandler }
								leftSideItem={ leftSideItem }
								renderLeftSideItem={ ( incomingItem ) => generateLeftItem( incomingItem ) }
								renderRightSideItem={ ( incomingItem ) => generateRightItem( incomingItem, key ) }
								useShortLabel={ useShortLabel }
								useShortNumber={ useShortNumber }
								isStatic={ ! isInteractive }
								barMaxValue={ barMaxValue }
								additionalColumns={ additionalColumns?.body( item ) }
								usePlainCard={ usePlainCard }
								isLinkUnderlined={ isLinkUnderlined }
								leftGroupToggle={ item?.children && moduleType === 'tags-categories' } // tags and categories show toggle on the oposite side
								hasNoBackground={ hasNoBackground }
								formatValue={ formatValue }
							/>
						);
					} ) }
				</HorizontalBarList>
			) }
		</StatsCard>
	);
};

export default localize( StatsListCard );
