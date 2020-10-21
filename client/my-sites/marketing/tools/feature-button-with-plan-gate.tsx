/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { FunctionComponent } from 'react';
import page from 'page';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/url';
import { Button } from '@automattic/components';
import { getPlan } from 'calypso/lib/plans';
import { hasFeature } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

/**
 * Types
 */
import * as T from 'calypso/types';

interface ConnectedProps {
	hasPlanFeature: boolean;
	planTitle: string;
	selectedSiteSlug: T.SiteSlug | null;
}

interface ExternalProps {
	buttonText: string;
	feature: string;
	onDefaultButtonClick: () => void;
	onUpgradeButtonClick: () => void;
	planSlug: T.PlanSlug;
}

const MarketingToolsFeatureButtonWithPlanGate: FunctionComponent<
	ExternalProps & ConnectedProps
> = ( {
	buttonText,
	hasPlanFeature,
	onDefaultButtonClick,
	onUpgradeButtonClick,
	feature,
	planSlug,
	planTitle,
	selectedSiteSlug,
} ) => {
	const translate = useTranslate();

	const handleUpgradeClick = () => {
		if ( onUpgradeButtonClick ) {
			onUpgradeButtonClick();
		}

		page( addQueryArgs( { feature, plan: planSlug }, `/plans/${ selectedSiteSlug }` ) );
	};

	if ( hasPlanFeature ) {
		return <Button onClick={ onDefaultButtonClick }>{ buttonText }</Button>;
	}

	return (
		<Button onClick={ handleUpgradeClick }>
			{ translate( 'Upgrade to %(plan)s', {
				args: {
					plan: planTitle,
				},
			} ) }
		</Button>
	);
};

export default connect< ConnectedProps, {}, ExternalProps >( ( state, { feature, planSlug } ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		hasPlanFeature: selectedSiteId ? hasFeature( state, selectedSiteId, feature ) : false,
		planTitle: getPlan( planSlug ).getTitle(),
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( MarketingToolsFeatureButtonWithPlanGate );
