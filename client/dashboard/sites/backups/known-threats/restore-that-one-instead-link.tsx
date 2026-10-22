import {
	siteActivityLogQuery,
	siteBackupsKnownThreatsQuery,
	siteSettingsQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useId } from 'react';
import { useIntlLocale } from '../../../app/locale';
import RouterLinkButton from '../../../components/router-link-button';
import { Text } from '../../../components/text';
import { formatDate, formatDateWithOffset } from '../../../utils/datetime';

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

export function RestoreThatOneInsteadLink( {
	siteId,
	siteSlug,
	restoreLinkTo,
	latestWithoutKnownThreats,
	currentBackupPeriod,
}: RestoreThatOneInsteadLinkProps ) {
	const locale = useIntlLocale();
	const descriptionId = useId();
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

	// Wait for the lookup rather than flash a label that then changes.
	if ( ! hasTarget || completedAt === undefined || ! siteSettings ) {
		return null;
	}

	let label: string = __( 'Restore the latest backup without known threats instead' );
	if ( completedAt ) {
		const timezoneString = siteSettings.timezone_string || undefined;
		const format = ( options: Intl.DateTimeFormatOptions ) =>
			timezoneString
				? formatDate( completedAt, locale, { ...options, timeZone: timezoneString } )
				: formatDateWithOffset( completedAt, siteSettings.gmt_offset ?? 0, locale, options );
		label = sprintf(
			// translators: %1$s is a backup's date, e.g. "Oct 17, 2026"; %2$s its time, e.g. "2:30 PM". Reads "Restore Oct 17, 2026 at 2:30 PM backup instead".
			__( 'Restore %1$s at %2$s backup instead' ),
			format( { dateStyle: 'medium' } ),
			format( { timeStyle: 'short' } )
		);
	}

	const reason = __( "It's the most recent backup with no known security threats." );

	// The reason shows under the link, which also takes it as its description.
	return (
		<VStack spacing={ 1 } alignment="flex-start">
			<RouterLinkButton
				__next40pxDefaultSize
				variant="link"
				to={ restoreLinkTo }
				params={ { siteSlug, rewindId: String( latestWithoutKnownThreats ) } }
				aria-describedby={ descriptionId }
				onClick={ () => {
					rewindIdAwaitingFocus = String( latestWithoutKnownThreats );
				} }
			>
				{ label }
			</RouterLinkButton>
			<Text variant="muted" size={ 12 } id={ descriptionId }>
				{ reason }
			</Text>
		</VStack>
	);
}
