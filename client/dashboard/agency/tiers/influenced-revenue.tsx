import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	Popover,
	ProgressBar,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useState } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import { Text } from '../../components/text';
import { ALL_TIERS, TARGET_INFLUENCED_REVENUE } from './constants';
import getCurrentAgencyTier from './get-current-agency-tier';
import type { AgencyTierType, RecordTracksEvent, TierItem } from './types';

import './style.scss';

const LEARN_MORE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/agency-tiers-and-benefits/';

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
						<Text size={ 13 } lineHeight="20px">
							{ __(
								'Influenced revenue is revenue connected to your agency’s direct influence through referrals, client purchases, and managed sites using Automattic products.'
							) }
						</Text>
						<Text size={ 13 } lineHeight="20px">
							{ __(
								'Earn commissions by referring Automattic products to your clients, receive revenue share from WooPayments transactions, and unlock savings through volume discounts on bulk purchases.'
							) }
						</Text>
						<Text size={ 13 } lineHeight="20px">
							<InlineSupportLink
								supportLink={ LEARN_MORE_URL }
								forceOpenInHelpCenter
								onClick={ () =>
									recordTracksEvent( 'calypso_a4a_agency_tier_influenced_revenue_learn_more_click' )
								}
							>
								{ __( 'Learn more' ) }
							</InlineSupportLink>
						</Text>
					</VStack>
				</Popover>
			) }
		</HStack>
	);
}

const formatAmount = ( value: number ) => formatCurrency( value, 'USD', { stripZeros: true } );

const TOP_TIER_LEVEL = Math.max( ...ALL_TIERS.map( ( tier ) => tier.level ) );
const PRO_TIER_LEVEL = 2;

/**
 * Pro and VIP Pro both grow toward Premier, as the Overview growth card says.
 */
function getNextTier( currentTier: TierItem ) {
	if ( currentTier.level >= TOP_TIER_LEVEL ) {
		return undefined;
	}
	const nextLevel = currentTier.level >= PRO_TIER_LEVEL ? TOP_TIER_LEVEL : currentTier.level + 1;
	return ALL_TIERS.find( ( tier ) => tier.level === nextLevel );
}

function getProgress( currentTier: TierItem, total: number ) {
	const nextTier = getNextTier( currentTier );

	if ( ! nextTier ) {
		return {
			headline: formatAmount( total ),
			caption: sprintf(
				/* translators: %s is the tier name, e.g. Premier Partner */
				__( '%s is the top tier' ),
				currentTier.name
			),
			label: sprintf(
				/* translators: 1: influenced revenue, e.g. $268,500, 2: tier name, e.g. Premier Partner */
				__( '%1$s influenced revenue. %2$s is the top tier.' ),
				formatAmount( total ),
				currentTier.name
			),
			value: 100,
		};
	}

	const target = TARGET_INFLUENCED_REVENUE[ nextTier.id ];
	const remaining = target - total;

	return {
		headline:
			remaining > 0
				? sprintf(
						/* translators: 1: amount left, e.g. $1,200, 2: next tier name, e.g. Agency Partner */
						__( '%1$s more to reach %2$s' ),
						formatAmount( remaining ),
						nextTier.name
					)
				: sprintf(
						/* translators: %s is the next tier name, e.g. Agency Partner */
						__( 'You’ve reached the target for %s' ),
						nextTier.name
					),
		caption: sprintf(
			/* translators: 1: influenced revenue so far, 2: next tier target. Example: $0 of $1,200 */
			__( '%1$s of %2$s' ),
			formatAmount( total ),
			formatAmount( target )
		),
		label: sprintf(
			/* translators: 1: influenced revenue so far, 2: next tier target, 3: next tier name */
			__( '%1$s of %2$s influenced revenue for %3$s.' ),
			formatAmount( total ),
			formatAmount( target ),
			nextTier.name
		),
		value: Math.min( 100, Math.max( 0, Math.floor( ( total / target ) * 100 ) ) ),
	};
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

	const { headline, caption, label, value } = getProgress( currentTier, totalInfluencedRevenue );

	return (
		<VStack spacing={ 2 }>
			<InfluencedRevenueStrapline recordTracksEvent={ recordTracksEvent } />
			<Text size={ 15 } weight={ 500 } lineHeight="20px" style={ { textWrap: 'balance' } }>
				{ headline }
			</Text>
			<ProgressBar
				className="agency-tiers-influenced-revenue-bar"
				value={ value }
				aria-label={ label }
			/>
			<Text variant="muted" size={ 12 } lineHeight="20px" style={ { textWrap: 'balance' } }>
				{ caption }
			</Text>
		</VStack>
	);
}
