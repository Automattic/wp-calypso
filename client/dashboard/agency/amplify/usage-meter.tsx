import { Link } from '@tanstack/react-router';
import { Button, Popover, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useIntlLocale } from '../../app/locale';
import Notice from '../../components/notice';
import { Text } from '../../components/text';
import { a4aLink } from '../../utils/link';
import { useScheduleCall } from '../tiers/use-schedule-call';
import { canContactForMoreScans, getTierAllowances } from './constants';
import { hasAllowance } from './usage';
import type { AmplifyUsageStatus } from './usage';
import type { AgencyTierId, AmplifyUsage } from '@automattic/api-core';

function useResetDate( usage?: AmplifyUsage ) {
	const locale = useIntlLocale();
	if ( ! usage?.resets_at ) {
		return null;
	}
	const date = new Date( usage.resets_at );
	if ( Number.isNaN( date.getTime() ) ) {
		return null;
	}
	return new Intl.DateTimeFormat( locale, {
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	} ).format( date );
}

/**
 * Info button + popover explaining monthly limits. Same pattern as the
 * "Influenced revenue" info button on the Tiers and Overview pages.
 */
function LimitsExplainer( { label, resetDate }: { label?: string; resetDate?: string | null } ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const { recordTracksEvent } = useAnalytics();
	return (
		<>
			<Button
				className="dashboard-amplify-usage__info"
				size="small"
				icon={ info }
				iconSize={ 16 }
				label={ label ?? __( 'More information about monthly reports' ) }
				onClick={ () => {
					setIsOpen( true );
					recordTracksEvent( 'calypso_a4a_amplify_usage_info_open' );
				} }
			/>
			{ isOpen && (
				<Popover
					offset={ 12 }
					placement="bottom-start"
					focusOnMount
					onClose={ () => setIsOpen( false ) }
				>
					<VStack spacing={ 3 } style={ { width: '280px', padding: '8px' } }>
						<Text size={ 13 } lineHeight="20px">
							{ resetDate
								? sprintf(
										/* translators: %s: date the allowance resets, e.g. November 1 */
										__(
											'Your agency tier sets how many reports you can create each month. Each one comes out of your allowance, which resets on %s.'
										),
										resetDate
									)
								: __(
										'Your agency tier sets how many reports you can create each month. Each one comes out of your allowance, which resets on the 1st of every month.'
									) }
						</Text>
						<ul className="dashboard-amplify-usage__tiers">
							{ getTierAllowances().map( ( tier ) => (
								<li key={ tier.label }>
									<Text size={ 13 } lineHeight="20px">
										{ sprintf(
											/* translators: 1: agency tier name, 2: number of scans per month */
											__( '%1$s: %2$d reports/mo' ),
											tier.label,
											tier.scans
										) }
									</Text>
								</li>
							) ) }
						</ul>
						{ /*
						 * BACKEND REQUIRED: the API must exclude failed and timed-out audits
						 * from `usage.used`. This copy only describes that rule; the
						 * dashboard can't enforce it.
						 */ }
						<Text size={ 13 } lineHeight="20px">
							{ __( 'Reports that fail or time out don’t count toward your allowance.' ) }
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
		</>
	);
}

/**
 * "X scans left this month" with the limits explainer, shown under the URL field.
 */
export function AmplifyScansLeft( {
	usage,
	status,
}: {
	usage?: AmplifyUsage;
	status: AmplifyUsageStatus;
} ) {
	const resetDate = useResetDate( usage );
	if ( ! usage || ! hasAllowance( status ) ) {
		return null;
	}
	const left = Math.max( 0, usage.limit - usage.used );
	return (
		<div className="dashboard-amplify-scans-left" data-status={ status }>
			<Text size={ 12 } lineHeight="16px" variant="muted">
				{ left === 0
					? __( 'No reports left this month' )
					: sprintf(
							/* translators: %d: number of scans left this month */
							_n( '%d report left this month', '%d reports left this month', left ),
							left
						) }
			</Text>
			<LimitsExplainer resetDate={ resetDate } />
		</div>
	);
}

/**
 * Compact counter for the page header: "3 of 15 scans used · Resets November 1".
 */
export function AmplifyUsageMeter( {
	usage,
	status,
}: {
	usage?: AmplifyUsage;
	status: AmplifyUsageStatus;
} ) {
	const resetDate = useResetDate( usage );
	if ( ! usage || ! hasAllowance( status ) ) {
		return null;
	}
	// The bar fills as audits are used and turns red when the allowance is gone.
	const percent = Math.min( 100, Math.round( ( usage.used / Math.max( 1, usage.limit ) ) * 100 ) );
	return (
		<div className="dashboard-amplify-usage" data-status={ status }>
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
			<Text size={ 13 } className="dashboard-amplify-usage__label">
				{ sprintf(
					/* translators: 1: audits used this month, 2: monthly audit limit */
					__( '%1$d of %2$d reports' ),
					Math.min( usage.used, usage.limit ),
					usage.limit
				) }
			</Text>
			<LimitsExplainer resetDate={ resetDate } />
		</div>
	);
}

/**
 * Awaiting review, not approved, and cap-reached notices. Renders nothing while scans are available.
 */
export function AmplifyLimitNotice( {
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
	const { recordTracksEvent } = useAnalytics();
	const { scheduleCall, isLoading: isScheduling } = useScheduleCall( agencyId );
	const resetDate = useResetDate( usage );

	// Same language as the Overview "We’re reviewing your account" card and
	// the marketplace approval notice.
	if ( status === 'pending' ) {
		return (
			<Notice variant="warning" title={ __( 'We’re reviewing your account' ) }>
				{ __(
					'Feel free to explore while we review your agency. Reports unlock once your account is activated, and most are activated within one business day.'
				) }
			</Notice>
		);
	}

	if ( status === 'rejected' ) {
		return (
			<Notice variant="error" title={ __( 'Your application wasn’t approved' ) }>
				{ createInterpolateElement(
					__(
						'We have not approved your application for the Automattic for Agencies program. Please <a>contact support</a> to discuss this further if you think this was done in error.'
					),
					// Same target as the marketplace approval notice until the MSD has a support widget.
					{ a: <a href={ a4aLink( '/overview#contact-support' ) } /> }
				) }
			</Notice>
		);
	}

	if ( status !== 'cap' || ! usage ) {
		return null;
	}

	const showContact = canContactForMoreScans( tierId );
	return (
		<Notice
			variant="warning"
			title={ sprintf(
				/* translators: %d: monthly scan limit */
				__( 'You’ve used all %d reports this month' ),
				usage.limit
			) }
			actions={
				showContact ? (
					<Button
						variant="primary"
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
				) : undefined
			}
		>
			{ resetDate
				? sprintf(
						/* translators: %s: date the allowance resets, e.g. November 1 */
						__( 'Your allowance resets on %s. Your existing reports are still here to download.' ),
						resetDate
					)
				: __(
						'Your allowance resets next month. Your existing reports are still here to download.'
					) }
		</Notice>
	);
}
