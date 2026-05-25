import { Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import InfoModal from 'calypso/a8c-for-agencies/components/a4a-info-modal';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import { Stat } from 'calypso/a8c-for-agencies/components/stat';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import getCurrentAgencyTier from '../lib/get-current-agency-tier';
import type { AgencyTierType } from './types';

import './influenced-revenue.scss';

const LEARN_MORE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

function InfluencedRevenueStrapline() {
	const translate = useTranslate();
	const { showSupportGuide } = useHelpCenter();
	const title = translate( 'Influenced revenue' );
	const [ iconNode, setIconNode ] = useState< HTMLSpanElement | null >( null );
	const [ showPopover, setShowPopover ] = useState( false );
	const isMobile = useMobileBreakpoint();

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
						a: <Button variant="link" onClick={ () => showSupportGuide( LEARN_MORE_URL ) } />,
						br: <br />,
					},
				}
			) }
		</div>
	);

	return (
		<span className="influenced-revenue__strapline">
			{ title }
			<span
				className="influenced-revenue__info-icon"
				ref={ setIconNode }
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
