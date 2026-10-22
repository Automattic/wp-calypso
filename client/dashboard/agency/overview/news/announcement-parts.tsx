import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useIntlLocale } from '../../../app/locale';
import { ButtonStack } from '../../../components/button-stack';
import RouterLinkButton from '../../../components/router-link-button';
import { Text } from '../../../components/text';
import { isDashboardPath } from '../../../utils/link';
import NewTabLabel from '../new-tab-label';
import { ANNOUNCEMENT_LOGOS } from './announcements';
import type { Announcement, AnnouncementCta } from './announcements';
import type { RecordTracksEvent } from '../../tiers/types';

export interface AnnouncementActionProps {
	shouldUseRouterLink?: boolean;
	recordTracksEvent?: RecordTracksEvent;
}

/**
 * Joins the last two words with a no-break space, so marketing copy of any
 * length never ends a line on a single word.
 */
export function bindLastWords( text: string, count = 2 ) {
	const words = text.split( ' ' );
	if ( words.length <= count ) {
		return text;
	}
	return [ ...words.slice( 0, -count ), words.slice( -count ).join( '\u00a0' ) ].join( ' ' );
}

export function AnnouncementLogo( {
	announcement,
	size,
}: {
	announcement: Announcement;
	size: number;
} ) {
	return <AnnouncementLogoImage logo={ announcement.logo } size={ size } />;
}

export function AnnouncementLogoImage( {
	logo,
	size,
}: {
	logo: Announcement[ 'logo' ];
	size: number;
} ) {
	const { src, alt } = ANNOUNCEMENT_LOGOS[ logo ];
	return (
		<img
			className="a4a-news-logo"
			src={ src }
			alt={ alt }
			width={ size }
			height={ size }
			style={ { width: size, height: size } }
		/>
	);
}

/**
 * A blog post's own image, shown once the post is open: at row size a banner
 * image crops to nothing, so rows keep the logo.
 */
export function AnnouncementImage( { announcement }: { announcement: Announcement } ) {
	if ( ! announcement.image ) {
		return null;
	}
	// WordPress.com resizes uploads on the fly; ask for a 2x image of the panel width.
	return (
		<img className="a4a-news-image" src={ `${ announcement.image }?w=880` } alt="" loading="lazy" />
	);
}

const DAY = 24 * 60 * 60 * 1000;
// Announcements have no date of their own; for two weeks after they start they read as new.
const NEW_FOR_DAYS = 14;

function calendarDaysFrom( iso: string, now: Date ) {
	const day = new Date( iso.length > 10 ? iso : `${ iso }T12:00:00` );
	const from = new Date( now );
	day.setHours( 0, 0, 0, 0 );
	from.setHours( 0, 0, 0, 0 );
	return Math.round( ( day.getTime() - from.getTime() ) / DAY );
}

/**
 * The date column: when an event happens (and how soon), when an offer ends, when a
 * post went up, or a New badge for an announcement in its first two weeks.
 */
export function AnnouncementDate( { announcement }: { announcement: Announcement } ) {
	const locale = useIntlLocale();
	const { when } = announcement;
	if ( ! when ) {
		return null;
	}
	const now = new Date();
	const days = calendarDaysFrom( when.date, now );
	if ( when.kind === 'started' ) {
		return days > -NEW_FOR_DAYS ? (
			<span className="a4a-news-date">
				<Badge intent="informational">{ __( 'New' ) }</Badge>
			</span>
		) : null;
	}
	const date = new Date( when.date.length > 10 ? when.date : `${ when.date }T12:00:00` );
	const label = date.toLocaleDateString( locale, { month: 'short', day: 'numeric' } );
	let note = '';
	if ( when.kind === 'event' ) {
		if ( days <= 0 ) {
			note = __( 'Today' );
		} else if ( days === 1 ) {
			note = __( 'Tomorrow' );
		} else {
			/* translators: %d is the number of days until the event */
			note = sprintf( _n( 'In %d day', 'In %d days', days ), days );
		}
	} else if ( when.kind === 'ends' ) {
		note = __( 'Offer ends' );
	}
	return (
		<span className="a4a-news-date">
			<Text size={ 13 } weight={ 500 } lineHeight="20px">
				{ label }
			</Text>
			{ note && (
				<Text variant="muted" size={ 12 } lineHeight="16px">
					{ note }
				</Text>
			) }
		</span>
	);
}

export function AnnouncementEyebrow( { children }: { children: string } ) {
	return (
		<Text
			variant="muted"
			size={ 11 }
			weight={ 500 }
			lineHeight="16px"
			upperCase
			className="a4a-news-pretty"
		>
			{ bindLastWords( children ) }
		</Text>
	);
}

export function AnnouncementDescription( { announcement }: { announcement: Announcement } ) {
	return (
		<Text as="p" size={ 13 } lineHeight="20px" className="a4a-news-pretty">
			{ bindLastWords( announcement.description ) }
		</Text>
	);
}

function trackCta(
	recordTracksEvent: RecordTracksEvent | undefined,
	announcement: Announcement,
	ctaId: 'primary' | 'secondary'
) {
	recordTracksEvent?.( 'calypso_a4a_overview_event_cta_click', {
		event_id: announcement.id,
		cta_id: ctaId,
	} );
}

function CtaButton( {
	cta,
	variant,
	onClick,
	shouldUseRouterLink,
}: {
	cta: AnnouncementCta;
	variant: 'secondary' | 'tertiary';
	onClick: () => void;
	shouldUseRouterLink?: boolean;
} ) {
	const isMobileViewport = useViewportMatch( 'mobile', '<' );
	const buttonProps = {
		__next40pxDefaultSize: true,
		size: 'compact' as const,
		variant,
		style: isMobileViewport ? { width: '100%', justifyContent: 'center' } : undefined,
		onClick,
	};
	if ( shouldUseRouterLink && ! cta.isExternal && isDashboardPath( cta.url ) ) {
		return (
			<RouterLinkButton { ...buttonProps } to={ cta.url }>
				{ cta.label }
			</RouterLinkButton>
		);
	}
	return (
		<Button
			{ ...buttonProps }
			href={ cta.url }
			target={ cta.isExternal ? '_blank' : undefined }
			rel={ cta.isExternal ? 'noreferrer' : undefined }
		>
			{ cta.isExternal ? <NewTabLabel>{ cta.label }</NewTabLabel> : cta.label }
		</Button>
	);
}

/**
 * The open item's actions: secondary, then tertiary, so the Overview keeps one primary
 * button (Schedule a check-in) and the news never competes with it.
 */
export function AnnouncementCtas( {
	announcement,
	shouldUseRouterLink = true,
	recordTracksEvent,
}: { announcement: Announcement } & AnnouncementActionProps ) {
	const { primaryCta, secondaryCta } = announcement;
	return (
		<ButtonStack justify="flex-start" wrap>
			<CtaButton
				cta={ primaryCta }
				variant="secondary"
				shouldUseRouterLink={ shouldUseRouterLink }
				onClick={ () => trackCta( recordTracksEvent, announcement, 'primary' ) }
			/>
			{ secondaryCta && (
				<CtaButton
					cta={ secondaryCta }
					variant="tertiary"
					shouldUseRouterLink={ shouldUseRouterLink }
					onClick={ () => trackCta( recordTracksEvent, announcement, 'secondary' ) }
				/>
			) }
		</ButtonStack>
	);
}
