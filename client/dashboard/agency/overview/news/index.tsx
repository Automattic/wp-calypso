import { agencyAnnouncementsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Fragment, useMemo, useState } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { CollapsibleCard } from '../../../components/collapsible-card';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import FilterPills from '../../components/filter-pills';
import {
	AnnouncementCtas,
	AnnouncementDate,
	AnnouncementDescription,
	AnnouncementEyebrow,
	AnnouncementLogo,
	bindLastWords,
} from './announcement-parts';
import type { AnnouncementActionProps } from './announcement-parts';
import type { Announcement, AnnouncementType } from './announcements';
import type { FilterPill } from '../../components/filter-pills';
import type { Field, View } from '@wordpress/dataviews';

import './style.scss';

type NewsFilter = 'all' | AnnouncementType;

// Five rows a page: past about five, choosing among them gets slower.
const PER_PAGE = 5;
const NO_ANNOUNCEMENTS: Announcement[] = [];

const TYPE_LABELS: Record< AnnouncementType, string > = {
	event: __( 'Events' ),
	announcement: __( 'Announcements' ),
};
const TYPE_ORDER: AnnouncementType[] = [ 'event', 'announcement' ];

function NewsHeader( { children }: { children?: React.ReactNode } ) {
	return (
		<CardHeader>
			<VStack spacing={ 4 }>
				<SectionHeader
					level={ 3 }
					title={ __( 'News and updates' ) }
					description={ bindLastWords(
						__(
							'Stay informed with important announcements, events, and opportunities from Automattic for Agencies.'
						),
						3
					) }
				/>
				{ children }
			</VStack>
		</CardHeader>
	);
}

/** Only the types in the list get a pill; picking the selected one again goes back to All. */
function NewsFilters( {
	announcements,
	value,
	onChange,
}: {
	announcements: Announcement[];
	value: NewsFilter;
	onChange: ( value: NewsFilter ) => void;
} ) {
	const types = TYPE_ORDER.filter( ( type ) =>
		announcements.some( ( item ) => item.type === type )
	);
	if ( types.length < 2 ) {
		return null;
	}
	const options: FilterPill< NewsFilter >[] = [
		{ value: 'all', label: __( 'All' ), count: announcements.length },
		...types.map( ( type ) => ( {
			value: type,
			label: TYPE_LABELS[ type ],
			count: announcements.filter( ( item ) => item.type === type ).length,
		} ) ),
	];
	return (
		<FilterPills
			label={ __( 'Show' ) }
			options={ options }
			value={ value }
			onChange={ ( next ) => onChange( next === value && next !== 'all' ? 'all' : next ) }
		/>
	);
}

/** One item: a short row that opens in place to show the rest of its fields. */
function NewsRow( {
	announcement,
	isOpen,
	canToggle,
	onToggle,
	...actionProps
}: {
	announcement: Announcement;
	isOpen: boolean;
	canToggle: boolean;
	onToggle: () => void;
} & AnnouncementActionProps ) {
	const summary = (
		<HStack spacing={ 3 } justify="flex-start" alignment="flex-start" className="a4a-news-summary">
			<AnnouncementLogo announcement={ announcement } size={ 40 } />
			<VStack spacing={ 1 } className="a4a-news-text">
				<AnnouncementEyebrow>{ announcement.eyebrow }</AnnouncementEyebrow>
				<Text size={ 13 } weight={ 500 } lineHeight="20px">
					{ bindLastWords( announcement.headline ) }
				</Text>
				{ isOpen && (
					<Text variant="muted" size={ 12 } lineHeight="16px">
						{ announcement.subtitle }
					</Text>
				) }
			</VStack>
			<AnnouncementDate announcement={ announcement } />
		</HStack>
	);
	const panel = (
		<VStack spacing={ 4 } className="a4a-news-row-panel">
			<AnnouncementDescription announcement={ announcement } />
			<AnnouncementCtas announcement={ announcement } { ...actionProps } />
		</VStack>
	);

	// A single item has nothing to choose between, so it stays open with no toggle.
	if ( ! canToggle ) {
		return (
			<CardBody>
				{ summary }
				{ panel }
			</CardBody>
		);
	}

	return (
		<CollapsibleCard
			isBorderless
			header={ summary }
			toggleLabel={ announcement.headline }
			toggleAlignment="top"
			expanded={ isOpen }
			onToggle={ onToggle }
		>
			{ panel }
		</CollapsibleCard>
	);
}

interface NewsCardProps extends AnnouncementActionProps {
	agencyId: number;
}

/**
 * News and updates on the agency Overview: the events, promos and announcements
 * marketing publishes, in the order the server returns them. DataViews
 * filters and pages the list; its pagination is the native control.
 */
export default function NewsCard( { agencyId, ...actionProps }: NewsCardProps ) {
	const { data: announcements = NO_ANNOUNCEMENTS } = useQuery(
		agencyAnnouncementsQuery( agencyId )
	);

	const [ view, setView ] = useState< View >( {
		type: 'list',
		fields: [],
		search: '',
		filters: [],
		page: 1,
		perPage: PER_PAGE,
	} );
	const [ openId, setOpenId ] = useState< string | null | undefined >( undefined );
	const fields: Field< Announcement >[] = useMemo(
		() => [
			{
				id: 'headline',
				label: __( 'Headline' ),
				getValue: ( { item } ) => item.headline,
				enableGlobalSearch: true,
			},
			{
				id: 'type',
				label: __( 'Type' ),
				type: 'text',
				getValue: ( { item } ) => item.type,
				elements: TYPE_ORDER.filter( ( type ) =>
					announcements.some( ( item ) => item.type === type )
				).map( ( type ) => ( { value: type, label: TYPE_LABELS[ type ] } ) ),
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				enableHiding: false,
			},
		],
		[ announcements ]
	);
	const { data, paginationInfo } = useMemo(
		() => filterSortAndPaginate( announcements, view, fields ),
		[ announcements, view, fields ]
	);

	// Hidden while loading and when there's nothing to show.
	if ( ! announcements.length ) {
		return null;
	}

	const typeFilter = view.filters?.find( ( { field } ) => field === 'type' );
	const filterValue: NewsFilter =
		TYPE_ORDER.find( ( type ) => type === typeFilter?.value ) ?? 'all';
	const changeFilter = ( value: NewsFilter ) => {
		actionProps.recordTracksEvent?.( 'calypso_a4a_overview_news_filter_click', { filter: value } );
		setView( {
			...view,
			filters: value === 'all' ? [] : [ { field: 'type', operator: 'is', value } ],
			page: 1,
		} );
		setOpenId( undefined );
	};
	// The first item on each page or filter opens until someone picks another or closes it.
	const openItemId =
		openId === undefined || ( openId !== null && ! data.some( ( { id } ) => id === openId ) )
			? data[ 0 ]?.id
			: openId;

	return (
		<Card className="a4a-news">
			<DataViews< Announcement >
				data={ data }
				fields={ fields }
				view={ view }
				onChangeView={ ( next ) => {
					setView( next );
					setOpenId( undefined );
				} }
				paginationInfo={ paginationInfo }
				defaultLayouts={ { list: {} } }
				getItemId={ ( item ) => item.id }
			>
				<NewsHeader>
					<NewsFilters
						announcements={ announcements }
						value={ filterValue }
						onChange={ changeFilter }
					/>
				</NewsHeader>
				{ data.map( ( announcement, index ) => (
					<Fragment key={ announcement.id }>
						{ index > 0 && <CardDivider /> }
						<NewsRow
							announcement={ announcement }
							isOpen={ openItemId === announcement.id }
							canToggle={ announcements.length > 1 }
							onToggle={ () => {
								if ( openItemId === announcement.id ) {
									setOpenId( null );
									return;
								}
								actionProps.recordTracksEvent?.( 'calypso_a4a_overview_news_item_open', {
									announcement_id: announcement.id,
									announcement_type: announcement.type,
								} );
								setOpenId( announcement.id );
							} }
							{ ...actionProps }
						/>
					</Fragment>
				) ) }
				{ paginationInfo.totalPages > 1 && (
					<>
						<CardDivider />
						<CardBody>
							<DataViews.Pagination />
						</CardBody>
					</>
				) }
			</DataViews>
		</Card>
	);
}
