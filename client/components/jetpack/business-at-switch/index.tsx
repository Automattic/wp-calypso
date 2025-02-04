import { WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { ComponentType } from 'react';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import FormattedHeader from 'calypso/components/formatted-header';
import WPCOMBusinessAT from 'calypso/components/jetpack/wpcom-business-at';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

type Props = {
	UpsellComponent: ComponentType;
};

const Placeholder = () => (
	<>
		<FormattedHeader
			id="business-at-switch"
			className="business-at-switch placeholder__header"
			headerText={ translate( 'Loading…' ) }
			align="left"
		/>

		<div className="business-at-switch placeholder__primary-promo"></div>
	</>
);

/**
 * This component selects the right view for non-Jetpack plans.
 * If the plan is an Atomic plan, we show a component to activate the
 * automated transfer process. If it's not, we show the upsell component.
 */
const BusinessATSwitch = ( { UpsellComponent }: Props ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	const featuresNotLoaded: boolean = useSelector(
		( state ) =>
			null === getFeaturesBySiteId( state, siteId ) && ! isRequestingSiteFeatures( state, siteId )
	);
	const canTransfer: boolean = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC )
	);

	// If we're not sure, show a loading screen.
	if ( featuresNotLoaded ) {
		return (
			<Main className="business-at-switch__loading">
				<QuerySiteFeatures siteIds={ [ siteId ] } />
				<Placeholder />
			</Main>
		);
	}

	// We know the site is not AT as it's not Jetpack,
	// so show the activation for Atomic plans.
	if ( canTransfer ) {
		return <WPCOMBusinessAT />;
	}

	// Show the upsell if it's not an Atomic plan.
	return <UpsellComponent />;
};

export default BusinessATSwitch;
