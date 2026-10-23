import { Link } from '@tanstack/react-router';
import {
	Button,
	Popover,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useIntlLocale } from '../../app/locale';
import { Card, CardBody } from '../../components/card';
import Notice from '../../components/notice';
import { Text } from '../../components/text';
import { a4aLink } from '../../utils/link';
import { ALL_TIERS } from '../tiers/constants';
import { useScheduleCall } from '../tiers/use-schedule-call';
import { canContactForMoreScans, getTierAllowances } from './constants';
import { hasAllowance } from './usage';
import type { AmplifyUsageStatus } from './usage';
import type { AgencyTierId, AmplifyUsage } from '@automattic/api-core';

function useResetDate( usage?: AmplifyUsage, month: 'long' | 'short' = 'long' ) {
	const locale = useIntlLocale();
	if ( ! usage?.resets_at ) {
		return null;
	}
	const date = new Date( usage.resets_at );
	if ( Number.isNaN( date.getTime() ) ) {
		return null;
	}
	return new Intl.DateTimeFormat( locale, {
		month,
		day: 'numeric',
		timeZone: 'UTC',
	} ).format( date );
}

/**
 * Info button + popover explaining monthly limits. Same pattern as the
 * "Influenced revenue" info button on the Tiers and Overview pages.
 */
/** Rising bars, filled up to the tier's rank: more filled means a higher tier. */
function TierLevel( { level, levels }: { level: number; levels: number } ) {
	return (
		<svg
			className="dashboard-amplify-usage__tier-level"
			viewBox={ `0 0 ${ levels * 4 - 1 } 12` }
			aria-hidden="true"
			focusable="false"
		>
			{ Array.from( { length: levels }, ( _, index ) => {
				const height = 3 + ( 9 / levels ) * ( index + 1 );
				return (
					<rect
						key={ index }
						x={ index * 4 }
						y={ 12 - height }
						width={ 3 }
						height={ height }
						rx={ 1 }
						data-filled={ index < level }
					/>
				);
			} ) }
		</svg>
	);
}

function LimitsExplainer( {
	label,
	text,
	tierId,
}: {
	label?: string;
	/** Shown before the info icon, e.g. the agency's tier. */
	text?: string;
	tierId?: AgencyTierId;
} ) {
	const [ openedBy, setOpenedBy ] = useState< 'hover' | 'click' | null >( null );
	const closeTimer = useRef< ReturnType< typeof setTimeout > | undefined >( undefined );
	const { recordTracksEvent } = useAnalytics();
	const allowances = getTierAllowances();
	const open = ( by: 'hover' | 'click' ) => {
		clearTimeout( closeTimer.current );
		if ( ! openedBy ) {
			recordTracksEvent( 'calypso_a4a_amplify_usage_info_open', { trigger: by } );
		}
		setOpenedBy( ( previous ) => ( previous === 'click' ? previous : by ) );
	};
	// A short delay lets the pointer travel from the trigger into the popover.
	const closeSoon = () => {
		clearTimeout( closeTimer.current );
		closeTimer.current = setTimeout(
			() => setOpenedBy( ( previous ) => ( previous === 'hover' ? null : previous ) ),
			150
		);
	};
	useEffect( () => () => clearTimeout( closeTimer.current ), [] );
	// One wrapper, so the popover's anchor never becomes another spaced item in the parent row.
	return (
		<span className="dashboard-amplify-usage__info-wrap">
			<Button
				className="dashboard-amplify-usage__info"
				size="small"
				icon={ info }
				iconSize={ 16 }
				iconPosition="right"
				label={ text ? undefined : ( label ?? __( 'More information about monthly reports' ) ) }
				aria-expanded={ !! openedBy }
				onMouseEnter={ () => open( 'hover' ) }
				onMouseLeave={ closeSoon }
				onClick={ () => ( openedBy === 'click' ? setOpenedBy( null ) : open( 'click' ) ) }
			>
				{ text }
			</Button>
			{ openedBy && (
				<Popover
					offset={ 8 }
					placement="bottom-end"
					focusOnMount={ openedBy === 'click' ? 'firstElement' : false }
					onClose={ () => setOpenedBy( null ) }
					onMouseEnter={ () => open( 'hover' ) }
					onMouseLeave={ closeSoon }
				>
					<VStack spacing={ 3 } style={ { width: '280px', padding: '12px' } }>
						<Text size={ 13 } weight={ 600 }>
							{ __( 'Monthly reports by tier' ) }
						</Text>
						<ol className="dashboard-amplify-usage__tiers">
							{ allowances
								.map( ( tier, index ) => ( { ...tier, level: index + 1 } ) )
								.reverse()
								.map( ( tier ) => {
									const isCurrent = !! tierId && tier.tiers.includes( tierId );
									return (
										<li key={ tier.label } data-current={ isCurrent }>
											<TierLevel level={ tier.level } levels={ allowances.length } />
											<span className="dashboard-amplify-usage__tier-name">
												{ tier.label }
												{ isCurrent && <small>{ __( 'Your tier' ) }</small> }
											</span>
											<span className="dashboard-amplify-usage__tier-count">
												{ sprintf(
													/* translators: %d: number of reports a month */
													__( '%d/mo' ),
													tier.scans
												) }
											</span>
										</li>
									);
								} ) }
						</ol>
						{ /*
						 * BACKEND REQUIRED: the API must exclude failed and timed-out audits
						 * from `usage.used`. This copy only describes that rule; the
						 * dashboard can't enforce it.
						 */ }
						<Text size={ 12 } lineHeight="16px" variant="muted">
							{ __( 'Reports that fail or time out don’t count.' ) }
						</Text>
						<Text size={ 13 } lineHeight="20px">
							<Link
								to="/tiers"
								onClick={ () => recordTracksEvent( 'calypso_a4a_amplify_usage_info_tiers_click' ) }
							>
								{ __( 'Learn about tier benefits' ) }
							</Link>
						</Text>
					</VStack>
				</Popover>
			) }
		</span>
	);
}

/**
 * "X scans left this month" with the limits explainer, shown under the URL field.
 */
export function AmplifyScansLeft( {
	agencyId,
	usage,
	status,
	tierId,
}: {
	agencyId: number;
	usage?: AmplifyUsage;
	status: AmplifyUsageStatus;
	tierId?: AgencyTierId;
} ) {
	const resetDate = useResetDate( usage, 'short' );
	const limitMessage = useLimitMessage( {
		agencyId,
		usage,
		status,
		tierId,
		resetDate,
		actionVariant: 'link',
	} );
	const message = status === 'cap' ? limitMessage : null;
	if ( message ) {
		return (
			<div className="dashboard-amplify-scans-left" data-status={ status }>
				<Text size={ 12 } lineHeight="18px" variant="muted">
					<span className="dashboard-amplify-scans-left__title">{ message.title }.</span>{ ' ' }
					{ message.body }
				</Text>
				{ message.action }
				<LimitsExplainer tierId={ tierId } />
			</div>
		);
	}
	if ( ! usage || ! hasAllowance( status ) ) {
		return null;
	}
	const left = Math.max( 0, usage.limit - usage.used );
	return (
		<div className="dashboard-amplify-scans-left" data-status={ status }>
			<Text size={ 12 } lineHeight="16px" variant="muted">
				{ sprintf(
					/* translators: %d: number of reports left this month */
					_n( '%d report left this month', '%d reports left this month', left ),
					left
				) }
			</Text>
			<LimitsExplainer tierId={ tierId } />
		</div>
	);
}

/**
 * Monthly usage: reports created, the agency's tier and when the allowance resets.
 */
export function AmplifyUsageMeter( {
	usage,
	status,
	tierId,
}: {
	usage?: AmplifyUsage;
	status: AmplifyUsageStatus;
	tierId?: AgencyTierId;
} ) {
	const resetDate = useResetDate( usage, 'short' );
	if ( ! usage || ! hasAllowance( status ) ) {
		return null;
	}
	const tierName = ALL_TIERS.find( ( tier ) => tier.id === tierId )?.name;
	const used = Math.min( usage.used, usage.limit );
	// The bar fills as reports are used and turns red when the allowance is gone.
	const percent = Math.min( 100, Math.round( ( usage.used / Math.max( 1, usage.limit ) ) * 100 ) );
	return (
		<VStack className="dashboard-amplify-usage" data-status={ status } spacing={ 3 }>
			<HStack wrap justify="space-between" alignment="center">
				<HStack spacing={ 2 } expanded={ false } wrap>
					<Text weight={ 500 }>
						{ sprintf(
							/* translators: 1: reports created this month, 2: monthly report limit */
							__( '%1$d of %2$d reports' ),
							used,
							usage.limit
						) }
					</Text>
					{ resetDate && (
						<Text variant="muted">
							{ sprintf(
								/* translators: %s: date the limit resets, e.g. Nov 1 */
								__( '• Resets %s' ),
								resetDate
							) }
						</Text>
					) }
				</HStack>
				<LimitsExplainer tierId={ tierId } text={ tierName } />
			</HStack>
			<div
				className="dashboard-amplify-usage__bar"
				role="meter"
				aria-valuemin={ 0 }
				aria-valuemax={ usage.limit }
				aria-valuenow={ Math.min( usage.used, usage.limit ) }
				aria-label={ __( 'Reports used this month' ) }
			>
				<span style={ { width: `${ percent }%` } } />
			</div>
		</VStack>
	);
}

type LimitMessage = {
	variant: 'warning' | 'error';
	title: string;
	body: React.ReactNode;
	action?: React.ReactNode;
};

/**
 * Awaiting review, not approved, and cap-reached copy. Null while reports are available.
 */
function useLimitMessage( {
	agencyId,
	usage,
	status,
	tierId,
	resetDate,
	actionVariant = 'secondary',
}: {
	agencyId: number;
	usage?: AmplifyUsage;
	status: AmplifyUsageStatus;
	tierId?: AgencyTierId;
	resetDate?: string | null;
	actionVariant?: 'secondary' | 'link';
} ): LimitMessage | null {
	const { recordTracksEvent } = useAnalytics();
	const { scheduleCall, isLoading: isScheduling } = useScheduleCall( agencyId );

	// Same language as the Overview "We’re reviewing your account" card and
	// the marketplace approval notice.
	if ( status === 'pending' ) {
		return {
			variant: 'warning',
			title: __( 'We’re reviewing your account' ),
			body: __(
				'Feel free to explore while we review your agency. Reports unlock once your account is activated, and most are activated within one business day.'
			),
		};
	}

	if ( status === 'rejected' ) {
		return {
			variant: 'error',
			title: __( 'Your application wasn’t approved' ),
			body: createInterpolateElement(
				__(
					'We have not approved your application for the Automattic for Agencies program. Please <a>contact support</a> to discuss this further if you think this was done in error.'
				),
				// Same target as the marketplace approval notice until the MSD has a support widget.
				{ a: <a href={ a4aLink( '/overview#contact-support' ) } /> }
			),
		};
	}

	if ( status !== 'cap' || ! usage ) {
		return null;
	}

	return {
		variant: 'warning',
		title: sprintf(
			/* translators: %d: monthly report limit */
			__( 'You’ve used all %d reports this month' ),
			usage.limit
		),
		body:
			resetDate === undefined
				? __( 'Your existing reports are still here to download.' )
				: sprintf(
						/* translators: %s: date the allowance resets, e.g. November 1 */
						__( 'Your allowance resets on %s. Your existing reports are still here to download.' ),
						resetDate ?? __( 'the 1st of next month' )
					),
		action: canContactForMoreScans( tierId ) ? (
			<Button
				__next40pxDefaultSize
				variant={ actionVariant }
				size="compact"
				isBusy={ isScheduling }
				onClick={ () => {
					recordTracksEvent( 'calypso_a4a_amplify_contact_for_more_click', {
						agency_tier: tierId,
					} );
					scheduleCall();
				} }
			>
				{ __( 'Need more? Contact us' ) }
			</Button>
		) : undefined,
	};
}

/**
 * The usage meter with any limit or approval message inside the same card, for the reports list.
 */
export function AmplifyUsageCard( {
	agencyId,
	usage,
	status,
	tierId,
}: {
	agencyId: number;
	usage?: AmplifyUsage;
	status: AmplifyUsageStatus;
	tierId?: AgencyTierId;
} ) {
	// The meter already shows the reset date, so the cap message leaves it out. Approval
	// messages are page notices, not part of the allowance.
	const limitMessage = useLimitMessage( { agencyId, usage, status, tierId } );
	const message = status === 'cap' ? limitMessage : null;
	const showMeter = !! usage && hasAllowance( status );
	if ( ! showMeter && ! message ) {
		return null;
	}
	return (
		<Card className="dashboard-amplify-results__usage">
			<CardBody size="small">
				<VStack spacing={ 4 }>
					{ showMeter && <AmplifyUsageMeter usage={ usage } status={ status } tierId={ tierId } /> }
					{ message && (
						<HStack alignment="center" spacing={ 4 } wrap>
							<VStack spacing={ 1 } style={ { flex: '1 1 320px' } }>
								<Text weight={ 500 }>{ message.title }</Text>
								<Text variant="muted">{ message.body }</Text>
							</VStack>
							{ message.action }
						</HStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

/**
 * Awaiting review and not approved, shown as a page notice.
 */
export function AmplifyApprovalNotice( {
	agencyId,
	status,
}: {
	agencyId: number;
	status: AmplifyUsageStatus;
} ) {
	const message = useLimitMessage( { agencyId, status } );
	if ( ! message || ( status !== 'pending' && status !== 'rejected' ) ) {
		return null;
	}
	return (
		<Notice variant={ message.variant } title={ message.title }>
			{ message.body }
		</Notice>
	);
}

/**
 * Replaces the new report form once the monthly allowance is used up.
 */
export function AmplifyLimitReached( {
	agencyId,
	usage,
	tierId,
}: {
	agencyId: number;
	usage?: AmplifyUsage;
	tierId?: AgencyTierId;
} ) {
	const resetDate = useResetDate( usage );
	const message = useLimitMessage( { agencyId, usage, status: 'cap', tierId, resetDate } );
	if ( ! message ) {
		return null;
	}
	const tierName = ALL_TIERS.find( ( tier ) => tier.id === tierId )?.name;
	return (
		<VStack className="dashboard-amplify-limit-reached" spacing={ 4 } alignment="center">
			<VStack spacing={ 1 } alignment="center">
				<Text weight={ 500 } size={ 15 }>
					{ message.title }
				</Text>
				<Text variant="muted">{ message.body }</Text>
			</VStack>
			<HStack spacing={ 3 } justify="center" expanded={ false } wrap>
				{ message.action }
				<LimitsExplainer tierId={ tierId } text={ tierName } />
			</HStack>
		</VStack>
	);
}
