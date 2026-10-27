import { agencyAnnouncementsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import clsx from 'clsx';
import { Fragment, useMemo, useState } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
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
import type { Field, View } from '@wordpress/dataviews';

import './style.scss';

type NewsFilter = 'all' | AnnouncementType;

const DIVIDER_STYLE = { borderColor: 'var(--color-gray-100)' };
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

/**
 * The filter pills: the Marketplace category tile (agency/components/showcase/spot-tiles)
 * made short. The same Card surface and outline, label type, hover ring and behaviour:
 * picking the selected one again goes back to All. Only the types in the list get one.
 */
function FilterPills( {
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
	const pills: { name: NewsFilter; label: string; count: number }[] = [
		{ name: 'all', label: __( 'All' ), count: announcements.length },
		...types.map( ( type ) => ( {
			name: type,
			label: TYPE_LABELS[ type ],
			count: announcements.filter( ( item ) => item.type === type ).length,
		} ) ),
	];
	return (
		<HStack
			spacing={ 2 }
			justify="flex-start"
			wrap
			role="group"
			aria-label={ __( 'Show' ) }
			className="a4a-news-filters"
		>
			{ pills.map( ( pill ) => {
				const isSelected = value === pill.name;
				const select = () => onChange( isSelected && pill.name !== 'all' ? 'all' : pill.name );
				return (
					<Card
						key={ pill.name }
						size="xSmall"
						className={ clsx( 'a4a-news-filter', { 'is-selected': isSelected } ) }
						role="button"
						tabIndex={ 0 }
						aria-pressed={ isSelected }
						onClick={ select }
						onKeyDown={ ( event: React.KeyboardEvent ) => {
							if ( event.key === 'Enter' || event.key === ' ' ) {
								event.preventDefault();
								select();
							}
						} }
					>
						<CardBody className="a4a-news-filter-body">
							<HStack spacing={ 1 } expanded={ false }>
								<Text
									size={ 13 }
									weight={ 500 }
									lineHeight="16px"
									className="a4a-news-filter-label"
								>
									{ pill.label }
								</Text>
								<Text
									variant="muted"
									size={ 13 }
									lineHeight="16px"
									className="a4a-news-filter-count"
								>
									{ pill.count }
								</Text>
							</HStack>
						</CardBody>
					</Card>
				);
			} ) }
		</HStack>
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
	const panelId = useInstanceId( NewsRow, 'a4a-news-panel' ) as string;
	// Spans, not divs: the summary sits inside the toggle button.
	const summary = (
		<HStack as="span" spacing={ 3 } justify="flex-start" alignment="flex-start">
			<AnnouncementLogo announcement={ announcement } size={ 32 } />
			<VStack as="span" spacing={ 1 } className="a4a-news-text">
				<AnnouncementEyebrow>{ announcement.eyebrow }</AnnouncementEyebrow>
				<Text size={ 13 } weight={ 500 } lineHeight="20px" className="a4a-news-balance">
					{ bindLastWords( announcement.headline ) }
				</Text>
				{ isOpen && (
					<Text variant="muted" size={ 12 } lineHeight="16px">
						{ announcement.subtitle }
					</Text>
				) }
			</VStack>
			<AnnouncementDate announcement={ announcement } />
			{ canToggle && (
				<Icon icon={ isOpen ? chevronUp : chevronDown } className="a4a-news-chevron" />
			) }
		</HStack>
	);

	return (
		<CardBody className="a4a-news-row">
			{ canToggle ? (
				<button
					type="button"
					className="a4a-news-row-toggle"
					aria-expanded={ isOpen }
					aria-controls={ panelId }
					onClick={ onToggle }
				>
					{ summary }
				</button>
			) : (
				summary
			) }
			{ isOpen && (
				<VStack spacing={ 4 } id={ panelId } className="a4a-news-row-panel">
					<AnnouncementDescription announcement={ announcement } />
					<AnnouncementCtas announcement={ announcement } { ...actionProps } />
				</VStack>
			) }
		</CardBody>
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
		setView( {
			...view,
			filters: value === 'all' ? [] : [ { field: 'type', operator: 'is', value } ],
			page: 1,
		} );
		setOpenId( undefined );
	};
	// The first item on each page or filter opens until someone picks another.
	const openItemId =
		openId === undefined || ! data.some( ( { id } ) => id === openId ) ? data[ 0 ]?.id : openId;

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
					<FilterPills
						announcements={ announcements }
						value={ filterValue }
						onChange={ changeFilter }
					/>
				</NewsHeader>
				{ data.map( ( announcement, index ) => (
					<Fragment key={ announcement.id }>
						{ index > 0 && <CardDivider style={ DIVIDER_STYLE } /> }
						<NewsRow
							announcement={ announcement }
							isOpen={ openItemId === announcement.id }
							canToggle={ announcements.length > 1 }
							onToggle={ () =>
								setOpenId( openItemId === announcement.id ? null : announcement.id )
							}
							{ ...actionProps }
						/>
					</Fragment>
				) ) }
				{ paginationInfo.totalPages > 1 && (
					<>
						<CardDivider style={ DIVIDER_STYLE } />
						<CardBody>
							<DataViews.Pagination />
						</CardBody>
					</>
				) }
			</DataViews>
		</Card>
	);
}
