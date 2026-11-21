import {
	siteActivityLogQuery,
	siteBackupsKnownThreatsQuery,
	siteSettingsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Tooltip } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { cloneElement, useCallback } from 'react';
import { useIntlLocale } from '../../../app/locale';
import { formatDate, formatDateWithOffset } from '../../../utils/datetime';
import type { ReactElement, ReactNode } from 'react';

// The Activity Log entries a successful backup ends with.
const BACKUP_COMPLETE_ACTIVITIES = [
	'rewind__backup_complete_full',
	'rewind__backup_complete_initial',
	'rewind__backup_only_complete_full',
	'rewind__backup_only_complete_initial',
];

// The rewind id the link last opened, until the page for it takes focus.
let rewindIdAwaitingFocus: string | null = null;

/**
 * The link, and the warning it sits in, are gone on the backup it opens, which would leave focus
 * on the page body. Returns a ref for the element that should take focus there instead; give that
 * element `tabIndex={ -1 }`.
 */
export function useRestoreInsteadFocusRef( rewindId: string ) {
	return useCallback(
		( node: HTMLElement | null ) => {
			if ( node && rewindIdAwaitingFocus === rewindId ) {
				rewindIdAwaitingFocus = null;
				node.focus();
			}
		},
		[ rewindId ]
	);
}

interface RestoreThatOneInsteadLinkProps {
	siteId: number;
	siteSlug: string;
	restoreLinkTo?: string;
	latestWithoutKnownThreats?: number | null;
	/** The backup period containing the backup being viewed, if known. */
	currentBackupPeriod?: number | null;
}

/**
 * When a backup finished: its "backup complete" Activity Log entry, which is the time the backup
 * lists show. A backup's period is when it started, and anything from the next period on belongs
 * to the next backup.
 */
function useBackupCompletedAt( siteId: number, period: number | null ): Date | null | undefined {
	const { data: page } = useQuery( {
		...siteBackupsKnownThreatsQuery( siteId ),
		enabled: !! period,
	} );
	const nextPeriod = period
		? ( page?.periods ?? [] ).filter( ( candidate ) => candidate > period ).sort()[ 0 ]
		: undefined;
	const before = period ? Math.min( nextPeriod ?? Infinity, period + 24 * 60 * 60 ) : 0;
	const { data, isError } = useQuery( {
		...siteActivityLogQuery( siteId, {
			name: BACKUP_COMPLETE_ACTIVITIES,
			aggregate: false,
			after: period ? new Date( period * 1000 ).toISOString() : undefined,
			before: period ? new Date( before * 1000 ).toISOString() : undefined,
			sort_order: 'asc',
			number: 10,
		} ),
		enabled: !! period && !! page,
	} );

	if ( isError ) {
		return null;
	}
	if ( ! data ) {
		return undefined;
	}
	const entry = data.activityLogs.find(
		( activity ) =>
			activity.rewind_id && Math.floor( Number( activity.rewind_id ) ) >= ( period ?? 0 )
	);
	return entry ? new Date( Number( entry.rewind_id ) * 1000 ) : null;
}

/**
 * The link, with the backup's date and time in a tooltip on hover and focus once they're known.
 * createInterpolateElement() passes the link text in as children.
 */
function LinkWithTooltip( {
	link,
	tooltip,
	children,
}: {
	link: ReactElement;
	tooltip?: string;
	children?: ReactNode;
} ) {
	// Always in the Tooltip, which shows nothing without text: wrapping the link only once the time
	// loads would remount it, and lose focus if it had it.
	return <Tooltip text={ tooltip }>{ cloneElement( link, undefined, children ) }</Tooltip>;
}

export function RestoreThatOneInsteadLink( {
	siteId,
	siteSlug,
	restoreLinkTo,
	latestWithoutKnownThreats,
	currentBackupPeriod,
}: RestoreThatOneInsteadLinkProps ) {
	const locale = useIntlLocale();
	const hasTarget =
		!! restoreLinkTo &&
		latestWithoutKnownThreats !== null &&
		latestWithoutKnownThreats !== undefined &&
		currentBackupPeriod !== latestWithoutKnownThreats;
	const { data: siteSettings } = useQuery( { ...siteSettingsQuery( siteId ), enabled: hasTarget } );
	const completedAt = useBackupCompletedAt(
		siteId,
		hasTarget ? ( latestWithoutKnownThreats as number ) : null
	);

	if ( ! hasTarget ) {
		return null;
	}

	const target = {
		to: restoreLinkTo,
		params: { siteSlug, rewindId: String( latestWithoutKnownThreats ) },
		onClick: () => {
			rewindIdAwaitingFocus = String( latestWithoutKnownThreats );
		},
	};

	// The backup's date and time, in a tooltip: in the sentence they made the link too long to read.
	let title: string | undefined;
	if ( completedAt && siteSettings ) {
		const timezoneString = siteSettings.timezone_string || undefined;
		const format = ( options: Intl.DateTimeFormatOptions ) =>
			timezoneString
				? formatDate( completedAt, locale, { ...options, timeZone: timezoneString } )
				: formatDateWithOffset( completedAt, siteSettings.gmt_offset ?? 0, locale, options );
		title = sprintf(
			// translators: %1$s is a backup's date, e.g. "October 17, 2026"; %2$s its time, e.g. "2:30 PM". Shown when hovering the link to that backup.
			__( 'Backup from %1$s at %2$s' ),
			format( { dateStyle: 'long' } ),
			format( { timeStyle: 'short' } )
		);
	}

	return createInterpolateElement(
		// translators: Follows the warning that the backup being viewed has known threats.
		__( 'Instead, restore the <link>latest backup without known threats</link>.' ),
		{ link: <LinkWithTooltip link={ <Link { ...target } /> } tooltip={ title } /> }
	);
}
