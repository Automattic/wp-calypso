import { translate } from 'i18n-calypso';
import { ReactElement, Component } from 'react';
import { useSelector } from 'react-redux';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import FormattedHeader from 'calypso/components/formatted-header';
import WPCOMBusinessAT from 'calypso/components/jetpack/wpcom-business-at';
import Main from 'calypso/components/main';
import isSiteOnAtomicPlan from 'calypso/state/selectors/is-site-on-atomic-plan';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

type Props = {
	UpsellComponent: typeof Component;
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
const BusinessATSwitch = ( { UpsellComponent }: Props ): ReactElement => {
	const siteId = useSelector( getSelectedSiteId ) as number;

	const currentPlan: Record< string, unknown > | null = useSelector( ( state ) =>
		getCurrentPlan( state, siteId )
	);
	const isATPlan = useSelector( ( state ) => isSiteOnAtomicPlan( state, siteId ) );

	// If we're not sure, show a loading screen.
	if ( ! currentPlan ) {
		return (
			<Main className="business-at-switch__loading">
				<QuerySitePlans siteId={ siteId } />
				<Placeholder />
			</Main>
		);
	}

	// We know the site is not AT as it's not Jetpack,
	// so show the activation for Atomic plans.
	if ( isATPlan ) {
		return <WPCOMBusinessAT />;
	}

	// Show the upsell if it's not an Atomic plan.
	return <UpsellComponent />;
};

export default BusinessATSwitch;
