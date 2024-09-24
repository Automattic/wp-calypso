import { WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { ComponentType } from 'react';
import WPCOMBusinessAT from 'calypso/components/jetpack/wpcom-business-at';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

type Props = {
	UpsellComponent: ComponentType;
};

/**
 * This component selects the right view for non-Jetpack plans.
 * If the plan is an Atomic plan, we show a component to activate the
 * automated transfer process. If it's not, we show the upsell component.
 */
const BusinessATSwitch = ( { UpsellComponent }: Props ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	const canTransfer: boolean = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC )
	);

	// We know the site is not AT as it's not Jetpack,
	// so show the activation for Atomic plans.
	if ( canTransfer ) {
		return <WPCOMBusinessAT />;
	}

	// Show the upsell if it's not an Atomic plan.
	return <UpsellComponent />;
};

export default BusinessATSwitch;
