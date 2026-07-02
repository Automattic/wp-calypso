import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import {
	Button,
	ExternalLink,
	Popover,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useState } from 'react';
import { Text } from '../../../../components/text';
import { getSiteData } from '../lib/site-data';
import type { RecordTracksEvent } from '../types';
import type { AgencyWooPaymentsData, AgencyWooPaymentsSiteState } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

// Inlined from client/a8c-for-agencies so the dashboard has no dependency on the classic A4A app.
// This CTA resolves in the classic A4A WooPayments site-setup flow until a dashboard equivalent exists.
const A4A_WOOPAYMENTS_SITE_SETUP_LINK = '/woopayments/site-setup';

const DEFAULT_INELIGIBLE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

interface IneligibleReasonInfo {
	message: string;
	link: string;
	linkText: string;
}

function getIneligibleReasonInfo( reason: string ): IneligibleReasonInfo {
	const defaultLinkText = __( 'Learn more about the incentive ↗' );

	switch ( reason ) {
		case 'rejected_stripe_account':
			return {
				message: __(
					'This WooPayments site isn’t eligible for commission because its Stripe account was rejected.'
				),
				link: 'https://support.stripe.com/',
				linkText: __( 'Contact Stripe support ↗' ),
			};
		case 'internal_account_owner':
			return {
				message: __(
					'This WooPayments site isn’t eligible for commission because it’s owned by an internal account.'
				),
				link: DEFAULT_INELIGIBLE_LINK,
				linkText: defaultLinkText,
			};
		case 'existing_merchant_after_30_days':
			return {
				message: __(
					'This WooPayments site isn’t eligible for commission because it’s an existing site that was connected to the agency account more than 30 days after the account was created.'
				),
				link: DEFAULT_INELIGIBLE_LINK,
				linkText: defaultLinkText,
			};
		// Add more error code mappings here as needed.
		default:
			return {
				message: __(
					'This WooPayments site isn’t eligible for commission under the current program criteria.'
				),
				link: DEFAULT_INELIGIBLE_LINK,
				linkText: defaultLinkText,
			};
	}
}

function getSiteDisplayUrl( siteUrl: string ): string {
	return siteUrl.replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
}

function EmptyValue() {
	return <Text variant="muted">—</Text>;
}

function WooPaymentsStatus( {
	state,
	siteId,
	recordTracksEvent,
}: {
	state: string;
	siteId: number;
	recordTracksEvent: RecordTracksEvent;
} ) {
	if ( ! state ) {
		return (
			<Button
				variant="tertiary"
				href={ `${ A4A_WOOPAYMENTS_SITE_SETUP_LINK }/?site_id=${ siteId }` }
				onClick={ () => recordTracksEvent( 'calypso_a4a_woopayments_setup_in_wp_admin' ) }
			>
				{ __( 'Continue setup' ) }
			</Button>
		);
	}

	switch ( state ) {
		case 'active':
			return <Badge intent="success">{ __( 'Active' ) }</Badge>;
		case 'disconnected':
			return <Badge intent="error">{ __( 'Disconnected' ) }</Badge>;
		default:
			return null;
	}
}

function CommissionEligibility( {
	state,
	siteId,
	commissions,
}: {
	state: string;
	siteId: number;
	commissions?: AgencyWooPaymentsData;
} ) {
	const [ showPopover, setShowPopover ] = useState( false );

	// Don't show eligibility status if WooPayments is not active.
	if ( state !== 'active' ) {
		return <EmptyValue />;
	}

	const isCommissionEligible = commissions?.data?.commission_eligible_sites?.includes( siteId );

	if ( isCommissionEligible ) {
		return <Badge intent="success">{ __( 'Eligible' ) }</Badge>;
	}

	const ineligibleSite = commissions?.data?.commission_ineligible_sites?.find(
		( site ) => site.blog_id === siteId
	);
	const reasonInfo = getIneligibleReasonInfo( ineligibleSite?.ineligible_reason ?? '' );

	return (
		<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
			<Badge intent="error">{ __( 'Not eligible' ) }</Badge>
			<Button
				size="small"
				icon={ info }
				iconSize={ 16 }
				label={ __( 'More information about commission eligibility' ) }
				onClick={ () => setShowPopover( true ) }
			/>
			{ showPopover && (
				<Popover
					offset={ 12 }
					placement="bottom-start"
					focusOnMount
					onClose={ () => setShowPopover( false ) }
				>
					<VStack spacing={ 3 } style={ { width: '280px', padding: '8px' } }>
						<Text>{ reasonInfo.message }</Text>
						<ExternalLink href={ localizeUrl( reasonInfo.link ) }>
							{ reasonInfo.linkText }
						</ExternalLink>
					</VStack>
				</Popover>
			) }
		</HStack>
	);
}

export function getWooPaymentsFields( {
	commissions,
	recordTracksEvent,
}: {
	commissions?: AgencyWooPaymentsData;
	recordTracksEvent: RecordTracksEvent;
} ): Field< AgencyWooPaymentsSiteState >[] {
	return [
		{
			id: 'site',
			label: __( 'Site' ),
			enableHiding: false,
			enableSorting: false,
			getValue: ( { item } ) => item.siteUrl,
			render: ( { item } ) => getSiteDisplayUrl( item.siteUrl ),
		},
		{
			id: 'transactions',
			label: __( 'Transactions' ),
			enableHiding: false,
			enableSorting: false,
			getValue: ( { item } ) => getSiteData( commissions, item.blogId ).transactions,
			render: ( { item } ) => {
				const { transactions } = getSiteData( commissions, item.blogId );
				return transactions ?? <EmptyValue />;
			},
		},
		{
			id: 'commissionsPaid',
			label: __( 'Commissions paid' ),
			enableHiding: false,
			enableSorting: false,
			getValue: ( { item } ) => getSiteData( commissions, item.blogId ).payout,
			render: ( { item } ) => {
				const { payout } = getSiteData( commissions, item.blogId );
				return payout ? formatCurrency( payout, 'USD', { stripZeros: true } ) : <EmptyValue />;
			},
		},
		{
			id: 'timeframeCommissions',
			label: __( 'Timeframe commissions' ),
			enableHiding: false,
			enableSorting: false,
			getValue: ( { item } ) => getSiteData( commissions, item.blogId ).estimatedPayout,
			render: ( { item } ) => {
				const { estimatedPayout } = getSiteData( commissions, item.blogId );
				return estimatedPayout ? (
					formatCurrency( estimatedPayout, 'USD', { stripZeros: true } )
				) : (
					<EmptyValue />
				);
			},
		},
		{
			id: 'woopaymentsStatus',
			label: __( 'WooPayments status' ),
			enableHiding: false,
			enableSorting: false,
			getValue: ( { item } ) => item.state,
			render: ( { item } ) => (
				<WooPaymentsStatus
					state={ item.state }
					siteId={ item.blogId }
					recordTracksEvent={ recordTracksEvent }
				/>
			),
		},
		{
			id: 'commissionEligibility',
			label: __( 'Commission eligibility' ),
			enableHiding: false,
			enableSorting: false,
			getValue: ( { item } ) =>
				commissions?.data?.commission_eligible_sites?.includes( item.blogId )
					? 'eligible'
					: 'not_eligible',
			render: ( { item } ) => (
				<CommissionEligibility
					state={ item.state }
					siteId={ item.blogId }
					commissions={ commissions }
				/>
			),
		},
	];
}
