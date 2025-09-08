import { BadgeType, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { memo, useState, useRef } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import { A4A_WOOPAYMENTS_SITE_SETUP_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { WooPaymentsData } from '../types';

import './style.scss';

export const SiteColumn = ( { site }: { site: string } ) => {
	return urlToSlug( site );
};

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
		// Check if site exists in woopaymentsData
		const siteExistsInWooPaymentsData = woopaymentsData?.data?.total?.sites?.[ siteId ];

		// If site is active but not in woopaymentsData, it's not eligible
		if ( state === 'active' && ! siteExistsInWooPaymentsData ) {
			return {
				statusText: translate( 'Not eligible' ),
				statusType: 'error',
				showInfoIcon: true,
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

	const popoverContent = (
		<div className="woopayments-status-popover">
			<p className="woopayments-status-popover__text">
				{ translate(
					'This WooPayments site is not eligible for commission since it was connected after the incentive expiration date.'
				) }
			</p>
			<Button
				variant="link"
				className="woopayments-status-popover__link"
				href={ localizeUrl(
					'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/'
				) }
				target="_blank"
			>
				<>
					{ translate( 'Learn more about the incentive' ) }
					<Icon icon={ external } size={ 18 } />
				</>
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
