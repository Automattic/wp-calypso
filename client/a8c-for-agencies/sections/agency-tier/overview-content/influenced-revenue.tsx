import { Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import InfoModal from 'calypso/a8c-for-agencies/components/a4a-info-modal';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import A4APopoverTrigger from 'calypso/a8c-for-agencies/components/a4a-popover/trigger';
import { Stat } from 'calypso/a8c-for-agencies/components/stat';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentAgencyTier from '../lib/get-current-agency-tier';
import type { AgencyTierType } from './types';

import './influenced-revenue.scss';

const LEARN_MORE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

function InfluencedRevenueStrapline() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();
	const title = translate( 'Influenced revenue' );
	const [ iconNode, setIconNode ] = useState< HTMLSpanElement | null >( null );
	const [ showPopover, setShowPopover ] = useState( false );
	const isMobile = useMobileBreakpoint();

	const openInfo = () => {
		setShowPopover( true );
		dispatch( recordTracksEvent( 'calypso_a4a_agency_tier_influenced_revenue_info_open' ) );
	};

	const onLearnMoreClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_agency_tier_influenced_revenue_learn_more_click' ) );
		showSupportGuide( LEARN_MORE_URL );
	};

	const content = (
		<div className="influenced-revenue__popover-content">
			{ translate(
				'Influenced revenue is revenue connected to your agency’s direct influence through referrals, client purchases, and managed sites using Automattic products.' +
					'{{br/}}{{br/}}' +
					'Earn commissions by referring Automattic products to your clients, receive revenue share from WooPayments transactions, and unlock savings through volume discounts on bulk purchases.' +
					'{{br/}}{{br/}}' +
					'{{a}}Learn more{{/a}}',
				{
					components: {
						a: <Button variant="link" onClick={ onLearnMoreClick } />,
						br: <br />,
					},
				}
			) }
		</div>
	);

	return (
		<span className="influenced-revenue__strapline">
			{ title }
			<A4APopoverTrigger
				className="influenced-revenue__info-icon"
				aria-label={ translate( 'More information about influenced revenue' ) }
				ref={ setIconNode }
				onActivate={ openInfo }
			>
				<Gridicon icon="info-outline" size={ 16 } />
			</A4APopoverTrigger>
			{ showPopover &&
				( isMobile ? (
					<InfoModal title={ title as string } onClose={ () => setShowPopover( false ) }>
						{ content }
					</InfoModal>
				) : (
					<A4APopover
						title=""
						offset={ 12 }
						anchor={ iconNode }
						focusOnMount="container"
						onFocusOutside={ () => setShowPopover( false ) }
					>
						{ content }
					</A4APopover>
				) ) }
		</span>
	);
}

export default function InfluencedRevenue( {
	currentAgencyTierId,
	totalInfluencedRevenue,
}: {
	currentAgencyTierId?: AgencyTierType;
	totalInfluencedRevenue: number;
} ) {
	const currentTier = getCurrentAgencyTier( currentAgencyTierId );

	if ( ! currentTier ) {
		return null;
	}

	const progressValue = Math.round(
		( totalInfluencedRevenue / currentTier.influencedRevenue ) * 100
	);

	return (
		<Stat
			density="high"
			strapline={ <InfluencedRevenueStrapline /> }
			metric={ formatCurrency( totalInfluencedRevenue, 'USD' ) }
			description={ formatCurrency( currentTier.influencedRevenue, 'USD' ) }
			progressValue={ progressValue }
			progressLabel={ `${ progressValue }%` }
		/>
	);
}
