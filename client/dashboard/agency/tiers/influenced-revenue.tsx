import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	ExternalLink,
	Popover,
	ProgressBar,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useState } from 'react';
import { Text } from '../../components/text';
import getCurrentAgencyTier from './get-current-agency-tier';
import type { AgencyTierType, RecordTracksEvent } from './types';

import './style.scss';

const LEARN_MORE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

function InfluencedRevenueStrapline( {
	recordTracksEvent,
}: {
	recordTracksEvent: RecordTracksEvent;
} ) {
	const [ showPopover, setShowPopover ] = useState( false );

	const openInfo = () => {
		setShowPopover( true );
		recordTracksEvent( 'calypso_a4a_agency_tier_influenced_revenue_info_open' );
	};

	return (
		<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
			<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
				{ __( 'Influenced revenue' ) }
			</Text>
			<Button
				size="small"
				icon={ info }
				iconSize={ 16 }
				label={ __( 'More information about influenced revenue' ) }
				onClick={ openInfo }
			/>
			{ showPopover && (
				<Popover
					offset={ 12 }
					placement="bottom-start"
					focusOnMount
					onClose={ () => setShowPopover( false ) }
				>
					<VStack spacing={ 3 } style={ { width: '280px', padding: '8px' } }>
						<Text>
							{ __(
								'Influenced revenue is revenue connected to your agency’s direct influence through referrals, client purchases, and managed sites using Automattic products.'
							) }
						</Text>
						<Text>
							{ __(
								'Earn commissions by referring Automattic products to your clients, receive revenue share from WooPayments transactions, and unlock savings through volume discounts on bulk purchases.'
							) }
						</Text>
						<ExternalLink
							href={ LEARN_MORE_URL }
							onClick={ () =>
								recordTracksEvent( 'calypso_a4a_agency_tier_influenced_revenue_learn_more_click' )
							}
						>
							{ __( 'Learn more' ) }
						</ExternalLink>
					</VStack>
				</Popover>
			) }
		</HStack>
	);
}

export default function InfluencedRevenue( {
	currentAgencyTierId,
	totalInfluencedRevenue,
	recordTracksEvent = () => {},
}: {
	currentAgencyTierId?: AgencyTierType;
	totalInfluencedRevenue: number;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const currentTier = getCurrentAgencyTier( currentAgencyTierId );

	if ( ! currentTier ) {
		return null;
	}

	const target = currentTier.influencedRevenue;
	const progressValue =
		target > 0 ? Math.min( 100, Math.round( ( totalInfluencedRevenue / target ) * 100 ) ) : 0;

	return (
		<VStack spacing={ 2 }>
			<InfluencedRevenueStrapline recordTracksEvent={ recordTracksEvent } />
			<ProgressBar className="agency-tiers-influenced-revenue-bar" value={ progressValue } />
			<HStack justify="space-between">
				<Text weight={ 500 }>{ formatCurrency( totalInfluencedRevenue, 'USD' ) }</Text>
				<Text variant="muted">{ formatCurrency( target, 'USD' ) }</Text>
			</HStack>
		</VStack>
	);
}
