import { Plans } from '@automattic/data-stores';
import { translate, TranslateResult } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { statTypeToPlan } from '../stat-type-to-plan';
import StatsCardUpsellJetpack from './stats-card-upsell-jetpack';
import StatsCardUpsellWPCOM from './stats-card-upsell-wpcom';

export interface Props {
	className?: string;
	statType: string;
	siteId: number;
	buttonLabel?: string | TranslateResult;
}

const StatsCardUpsell: React.FC< Props > = ( { className, statType, siteId, buttonLabel } ) => {
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const plans = Plans.usePlans( { coupon: undefined } );
	const planKey = statTypeToPlan( statType );
	const plan = plans?.data?.[ planKey ];

	let UpsellComponent = StatsCardUpsellWPCOM;
	let upsellButtonLabel = ! plan?.productNameShort
		? translate( 'Upgrade plan' )
		: translate( 'Upgrade to %(planName)s', {
				args: { planName: plan.productNameShort },
		  } );

	if ( isSiteJetpackNotAtomic ) {
		UpsellComponent = StatsCardUpsellJetpack;
		upsellButtonLabel = buttonLabel ?? translate( 'Upgrade plan' );
	}

	return (
		<UpsellComponent
			className={ className }
			statType={ statType }
			siteId={ siteId }
			buttonLabel={ upsellButtonLabel }
		/>
	);
};

export default StatsCardUpsell;
