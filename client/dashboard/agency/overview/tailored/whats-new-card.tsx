/**
 * PROTOTYPE — proof of concept only.
 *
 * “What’s new” card for the tailored Overview: tabs for upcoming events,
 * product announcements, and hand-picked blog posts. Events lead with a
 * featured event (logo, countdown, RSVP, add to calendar), then a dated list.
 * Announcements and posts lead with the items that match the agency's top goals. Replaces the single-event card in
 * the tailored layout.
 */
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
	TabPanel,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { Card, CardBody, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import NewTabLabel from '../new-tab-label';
import { getEventPitch, getRankedUpdates } from './updates';
import type { SignupGoal } from './signup-profile';
import type { UpdateItem, UpdateKind } from './updates';
import type { RecordTracksEvent } from '../../tiers/types';
import './style.scss';

const BLOG_URL = 'https://automattic.com/for-agencies/blog/';
const THUMB_SIZE = 56;

const formatEventDate = ( iso: string ) =>
	new Date( iso ).toLocaleString( undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	} );

const formatPostDate = ( iso: string ) =>
	// Post dates are calendar days, so read them as local dates.
	new Date( `${ iso }T12:00:00` ).toLocaleDateString( undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	} );

function Eyebrow( { item }: { item: UpdateItem } ) {
	const text =
		item.kind === 'event'
			? sprintf(
					/* translators: 1: event format such as Webinar, 2: date and time */
					__( '%1$s · %2$s' ),
					item.format ?? __( 'Event' ),
					formatEventDate( item.date )
				)
			: formatPostDate( item.date );
	return (
		<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
			{ text }
		</Text>
	);
}

function UpdateRow( { item, onOpen }: { item: UpdateItem; onOpen: ( item: UpdateItem ) => void } ) {
	return (
		<HStack spacing={ 3 } alignment="flex-start" justify="flex-start">
			{ item.imageUrl && (
				<img
					// WordPress.com resizes uploads on the fly; request a 2x thumbnail, not the full image.
					src={ `${ item.imageUrl }?w=${ THUMB_SIZE * 2 }&h=${ THUMB_SIZE * 2 }&crop=1` }
					alt=""
					width={ THUMB_SIZE }
					height={ THUMB_SIZE }
					loading="lazy"
					style={ { flexShrink: 0, objectFit: 'cover', borderRadius: '4px' } }
				/>
			) }
			<VStack spacing={ 1 }>
				<Eyebrow item={ item } />
				<ExternalLink href={ item.url } onClick={ () => onOpen( item ) }>
					{ item.title }
				</ExternalLink>
				<Text variant="muted" size={ 13 } lineHeight="20px">
					{ item.description }
				</Text>
			</VStack>
		</HStack>
	);
}

const DAY = 24 * 60 * 60 * 1000;

// “Today”, “Tomorrow”, or “In 12 days”, counted in calendar days.
function getCountdown( iso: string ) {
	const start = new Date( iso );
	const today = new Date();
	start.setHours( 0, 0, 0, 0 );
	today.setHours( 0, 0, 0, 0 );
	const days = Math.round( ( start.getTime() - today.getTime() ) / DAY );
	if ( days <= 0 ) {
		return __( 'Today' );
	}
	if ( days === 1 ) {
		return __( 'Tomorrow' );
	}
	/* translators: %d is the number of days until the event */
	return sprintf( _n( 'In %d day', 'In %d days', days ), days );
}

// A Google Calendar link prefilled with the event, assuming a one-hour session.
function getCalendarUrl( item: UpdateItem ) {
	const toStamp = ( date: Date ) => date.toISOString().replace( /[-:]|\.\d{3}/g, '' );
	const start = new Date( item.date );
	const end = new Date( start.getTime() + 60 * 60 * 1000 );
	const params = new URLSearchParams( {
		action: 'TEMPLATE',
		text: item.title,
		details: `${ item.description }\n\n${ item.url }`,
		dates: `${ toStamp( start ) }/${ toStamp( end ) }`,
	} );
	return `https://calendar.google.com/calendar/render?${ params.toString() }`;
}

function EventLogo( { item, size }: { item: UpdateItem; size: number } ) {
	if ( ! item.logo ) {
		return null;
	}
	return (
		<img
			src={ item.logo }
			alt={ item.logoAlt ?? '' }
			width={ size }
			height={ size }
			style={ { flexShrink: 0, borderRadius: '8px' } }
		/>
	);
}

// Event rows pair the date block with the logo, so both share one square size.
const EVENT_ROW_TILE_SIZE = 48;

function DateBlock( { iso }: { iso: string } ) {
	const date = new Date( iso );
	return (
		<VStack
			spacing={ 0 }
			alignment="center"
			justify="center"
			aria-hidden="true"
			style={ {
				flexShrink: 0,
				boxSizing: 'border-box',
				width: `${ EVENT_ROW_TILE_SIZE }px`,
				height: `${ EVENT_ROW_TILE_SIZE }px`,
				borderRadius: '8px',
				border: '1px solid var(--color-gray-100, #dcdcde)',
			} }
		>
			<Text size={ 11 } weight={ 600 } lineHeight="16px" upperCase intent="error">
				{ date.toLocaleDateString( undefined, { month: 'short' } ) }
			</Text>
			<Text size={ 20 } weight={ 600 } lineHeight="24px">
				{ date.getDate() }
			</Text>
		</VStack>
	);
}

function FeaturedEvent( {
	item,
	onOpen,
}: {
	item: UpdateItem;
	onOpen: ( item: UpdateItem ) => void;
} ) {
	return (
		<VStack
			spacing={ 4 }
			style={ {
				padding: '20px',
				borderRadius: '8px',
				background:
					'linear-gradient(135deg, rgba(56, 88, 233, 0.10) 0%, rgba(56, 88, 233, 0.02) 100%)',
				border: '1px solid rgba(56, 88, 233, 0.18)',
			} }
		>
			<HStack spacing={ 4 } alignment="flex-start" justify="flex-start">
				<EventLogo item={ item } size={ 64 } />
				<VStack spacing={ 1 } style={ { flex: 1, minWidth: 0 } }>
					<Eyebrow item={ item } />
					{ /* The countdown pill sits to the right of the title, centered on it. */ }
					<HStack spacing={ 3 } alignment="center" justify="space-between">
						<Heading level={ 3 } size={ 17 } weight={ 600 } lineHeight="24px">
							{ item.title }
						</Heading>
						<span style={ { flexShrink: 0 } }>
							<Badge intent="informational">{ getCountdown( item.date ) }</Badge>
						</span>
					</HStack>
					{ item.host && (
						<Text variant="muted" size={ 12 } lineHeight="16px">
							{ item.host }
						</Text>
					) }
				</VStack>
			</HStack>
			<Text size={ 13 } lineHeight="20px">
				{ item.description }
			</Text>
			<HStack spacing={ 2 } justify="flex-start" wrap>
				<Button
					variant="primary"
					size="compact"
					href={ item.url }
					target="_blank"
					rel="noreferrer"
					onClick={ () => onOpen( item ) }
				>
					<NewTabLabel>{ item.ctaLabel ?? __( 'RSVP' ) }</NewTabLabel>
				</Button>
				<Button
					variant="secondary"
					size="compact"
					href={ getCalendarUrl( item ) }
					target="_blank"
					rel="noreferrer"
				>
					<NewTabLabel>{ __( 'Add to calendar' ) }</NewTabLabel>
				</Button>
			</HStack>
		</VStack>
	);
}

function EventRow( {
	item,
	goals,
	onOpen,
}: {
	item: UpdateItem;
	goals: SignupGoal[];
	onOpen: ( item: UpdateItem ) => void;
} ) {
	return (
		<HStack spacing={ 3 } alignment="flex-start" justify="flex-start">
			<DateBlock iso={ item.date } />
			<EventLogo item={ item } size={ EVENT_ROW_TILE_SIZE } />
			<VStack spacing={ 1 } style={ { flex: 1, minWidth: 0 } }>
				<ExternalLink href={ item.url } onClick={ () => onOpen( item ) }>
					{ item.title }
				</ExternalLink>
				<Text size={ 13 } lineHeight="20px">
					{ getEventPitch( item, goals ) }
				</Text>
				<Text variant="muted" size={ 12 } lineHeight="16px">
					{ [ item.format, item.host, getCountdown( item.date ) ].filter( Boolean ).join( ' · ' ) }
				</Text>
			</VStack>
		</HStack>
	);
}

interface WhatsNewCardProps {
	goals: SignupGoal[];
	recordTracksEvent?: RecordTracksEvent;
}

export default function WhatsNewCard( { goals, recordTracksEvent }: WhatsNewCardProps ) {
	const tabs: { name: UpdateKind; title: string; empty: string }[] = [
		{ name: 'event', title: __( 'Events' ), empty: __( 'No upcoming events right now.' ) },
		{ name: 'announcement', title: __( 'Announcements' ), empty: __( 'No announcements yet.' ) },
		{ name: 'blog', title: __( 'From the blog' ), empty: __( 'No posts yet.' ) },
	];

	const handleOpen = ( item: UpdateItem ) =>
		recordTracksEvent?.( 'calypso_a4a_overview_whats_new_click', {
			item_id: item.id,
			kind: item.kind,
		} );

	return (
		<Card className="a4a-whats-new">
			{ /* The tabs sit on the header's divider, so the header itself is borderless. */ }
			<CardHeader isBorderless style={ { paddingBlockEnd: 0 } }>
				<SectionHeader
					level={ 2 }
					title={ __( 'What’s new' ) }
					description={ __( 'Events, product updates, and more, picked for your agency.' ) }
				/>
			</CardHeader>
			<TabPanel className="a4a-whats-new__tabs" tabs={ tabs }>
				{ ( tab ) => {
					const items = getRankedUpdates( tab.name as UpdateKind, goals );
					const empty = tabs.find( ( { name } ) => name === tab.name )?.empty;
					if ( tab.name === 'event' && items.length ) {
						const [ featured, ...rest ] = items;
						return (
							<CardBody>
								<VStack spacing={ 5 }>
									<FeaturedEvent item={ featured } onOpen={ handleOpen } />
									{ rest.map( ( item ) => (
										<EventRow key={ item.id } item={ item } goals={ goals } onOpen={ handleOpen } />
									) ) }
								</VStack>
							</CardBody>
						);
					}
					return (
						<CardBody>
							<VStack spacing={ 5 }>
								{ items.length ? (
									items.map( ( item ) => (
										<UpdateRow key={ item.id } item={ item } onOpen={ handleOpen } />
									) )
								) : (
									<Text variant="muted">{ empty }</Text>
								) }
								{ tab.name === 'blog' && (
									<ExternalLink href={ BLOG_URL }>{ __( 'Visit the blog' ) }</ExternalLink>
								) }
							</VStack>
						</CardBody>
					);
				} }
			</TabPanel>
		</Card>
	);
}
