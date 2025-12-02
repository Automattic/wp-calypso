import { BadgeType, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { memo, useState, useRef } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import { A4A_WOOPAYMENTS_SITE_SETUP_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { WooPaymentsData } from '../types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface IneligibleReasonInfo {
	message: TranslateResult;
	link: string;
	linkText: TranslateResult;
}

const getIneligibleReasonInfo = (
	reason: string,
	translate: ( text: string ) => TranslateResult
): IneligibleReasonInfo => {
	const defaultLink =
		'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';
	const defaultLinkText = translate( 'Learn more about the incentive ↗' );

	switch ( reason ) {
		case 'rejected_stripe_account':
			return {
				message: translate(
					"This WooPayments site isn't eligible for commission because its Stripe account was rejected."
				),
				link: 'https://support.stripe.com/',
				linkText: translate( 'Contact Stripe support ↗' ),
			};
		case 'internal_account_owner':
			return {
				message: translate(
					"This WooPayments site isn't eligible for commission because it's owned by an internal account."
				),
				link: defaultLink,
				linkText: defaultLinkText,
			};
		case 'existing_merchant_after_30_days':
			return {
				message: translate(
					"This WooPayments site isn't eligible for commission because it's an existing site that was connected to the agency account more than 30 days after the account was created."
				),
				link: defaultLink,
				linkText: defaultLinkText,
			};
		// Add more error code mappings here as needed
		default:
			return {
				message: translate(
					"This WooPayments site isn't eligible for commission under the current program criteria."
				),
				link: defaultLink,
				linkText: defaultLinkText,
			};
	}
};

export const SiteColumn = ( { site }: { site: string } ) => {
	return urlToSlug( site );
};

export const TransactionsColumn = memo( ( { transactions }: { transactions: number | null } ) => {
	return transactions ?? <Gridicon icon="minus" />;
} );
TransactionsColumn.displayName = 'TransactionsColumn';

export const CommissionsPaidColumn = memo( ( { payout }: { payout: number | null } ) => {
	return payout ? formatCurrency( payout, 'USD', { stripZeros: true } ) : <Gridicon icon="minus" />;
} );
CommissionsPaidColumn.displayName = 'CommissionsPaidColumn';

export const TimeframeCommissionsColumn = memo(
	( { estimatedPayout }: { estimatedPayout: number | null } ) => {
		return estimatedPayout ? (
			formatCurrency( estimatedPayout, 'USD', { stripZeros: true } )
		) : (
			<Gridicon icon="minus" />
		);
	}
);
TimeframeCommissionsColumn.displayName = 'TimeframeCommissionsColumn';

export const WooPaymentsStatusColumn = ( {
	state,
	siteId,
	woopaymentsData,
}: {
	state: string;
	siteId: number;
	woopaymentsData?: WooPaymentsData;
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ showPopover, setShowPopover ] = useState( false );
	const wrapperRef = useRef< HTMLDivElement | null >( null );

	if ( ! state ) {
		return (
			<Button
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_a4a_woopayments_setup_in_wp_admin' ) );
				} }
				variant="tertiary"
				href={ `${ A4A_WOOPAYMENTS_SITE_SETUP_LINK }/?site_id=${ siteId }` }
			>
				{ translate( 'Continue setup' ) }
			</Button>
		);
	}

	const getStatusProps = () => {
		// Check if site is commission eligible.
		const siteExistsInWooPaymentsData =
			woopaymentsData?.data?.commission_eligible_sites?.includes( siteId );

		// Find ineligibility reason if site is in commission_ineligible_sites
		const ineligibleSite = woopaymentsData?.data?.commission_ineligible_sites?.find(
			( site ) => site.blog_id === siteId
		);

		// If site is active but not commission eligible, show "Not eligible" status.
		if ( state === 'active' && ! siteExistsInWooPaymentsData ) {
			return {
				statusText: translate( 'Not eligible' ),
				statusType: 'error',
				showInfoIcon: true,
				ineligibleReason: ineligibleSite?.ineligible_reason,
			};
		}

		switch ( state ) {
			case 'active':
				return {
					statusText: translate( 'Active' ),
					statusType: 'success',
					showInfoIcon: false,
				};
			case 'disconnected':
				return {
					statusText: translate( 'Disconnected' ),
					statusType: 'error',
					showInfoIcon: false,
				};
			default:
				return null;
		}
	};

	const statusProps = getStatusProps();

	if ( ! statusProps ) {
		return null;
	}

	const reasonInfo = getIneligibleReasonInfo( statusProps.ineligibleReason ?? '', translate );

	const popoverContent = (
		<div className="woopayments-status-popover">
			<p className="woopayments-status-popover__text">{ reasonInfo.message }</p>
			<Button
				variant="link"
				className="woopayments-status-popover__link"
				href={ localizeUrl( reasonInfo.link ) }
				target="_blank"
			>
				{ reasonInfo.linkText }
			</Button>
		</div>
	);

	return (
		<div ref={ wrapperRef } className="woopayments-status-column">
			<StatusBadge
				statusProps={ {
					children: statusProps.statusText,
					type: statusProps.statusType as BadgeType,
				} }
			/>
			{ statusProps.showInfoIcon && (
				<>
					<span
						className="woopayments-status-column__info-icon"
						onClick={ () => setShowPopover( true ) }
						role="button"
						tabIndex={ 0 }
						onKeyDown={ ( event ) => {
							if ( event.key === 'Enter' ) {
								setShowPopover( true );
							}
						} }
					>
						<Gridicon icon="info-outline" size={ 16 } />
					</span>
					{ showPopover && (
						<A4APopover
							title=""
							offset={ 12 }
							wrapperRef={ wrapperRef }
							onFocusOutside={ () => setShowPopover( false ) }
						>
							{ popoverContent }
						</A4APopover>
					) }
				</>
			) }
		</div>
	);
};
