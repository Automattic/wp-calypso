import { HorizontalBarList, HorizontalBarListItem, StatsCard } from '@automattic/components';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import titlecase from 'to-title-case';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import OpenLink from './action-link'; // only for downloads
import StatsListActions from './stats-list-actions';

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
	children,
} ) => {
	const translate = useTranslate();
	const moduleNameTitle = titlecase( moduleType );
	const debug = debugFactory( `calypso:stats:list:${ moduleType }` );

	const localClickHandler = ( event, listItemData ) => {
		debug( 'clickHandler' );

		if ( listItemData?.page ) {
			gaRecordEvent( 'Stats', ` Clicked ${ moduleNameTitle } Summary Link in List` );
			page( listItemData.page );
		} else {
			// downloads component
			gaRecordEvent( 'Stats', ` Clicked ${ moduleNameTitle } External Link in List` );

			window.open( listItemData?.link );
		}
	};

	const barMaxValue = data?.[ 0 ]?.value || 0;

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
			className={ `list-${ moduleType }-pages` }
			metricLabel={ moduleType === 'filedownloads' ? translate( 'Downloads' ) : undefined }
			heroElement={ !! children && children }
		>
			{ !! loader && loader }
			{ !! error && error }
			<HorizontalBarList data={ data }>
				{ data?.map( ( item, index ) => {
					let rightSideItem;

					if ( moduleType === 'filedownloads' ) {
						// exception for file downloads because it doesn't have actions
						rightSideItem = (
							<StatsListActions>
								<OpenLink href={ item.link } key={ `link-${ index }` } moduleName={ moduleType } />
							</StatsListActions>
						);
					} else {
						rightSideItem = <StatsListActions data={ item } moduleName={ moduleType } />;
					}

					return (
						<HorizontalBarListItem
							key={ item?.id || index } // not every item has an id
							data={ item }
							maxValue={ barMaxValue }
							hasIndicator={ item?.className?.includes( 'published' ) }
							onClick={ ( e ) => localClickHandler( e, item ) }
							leftSideItem={ <div></div> }
							rightSideItem={ rightSideItem }
							useShortLabel={ useShortLabel }
						/>
					);
				} ) }
			</HorizontalBarList>
		</StatsCard>
	);
};

export default StatsListCard;
