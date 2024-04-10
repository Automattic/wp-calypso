import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import StatsCardUpsellJetpack from './stats-card-upsell-jetpack';
import StatsCardUpsellWPCOM from './stats-card-upsell-wpcom';

export interface Props {
	className: string;
	statType: string;
	siteId: number;
	buttonLabel?: string;
}

const StatsCardUpsell: React.FC< Props > = ( { className, statType, siteId, buttonLabel } ) => {
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	let UpsellComponent = StatsCardUpsellWPCOM;
	if ( isSiteJetpackNotAtomic || isOdysseyStats ) {
		UpsellComponent = StatsCardUpsellJetpack;
	}

	return (
		<UpsellComponent
			className={ className }
			statType={ statType }
			siteId={ siteId }
			buttonLabel={ buttonLabel ?? translate( 'Upgrade plan' ) }
		/>
	);
};

export default StatsCardUpsell;
