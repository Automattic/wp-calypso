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
import { addQueryArgs } from 'lib/url';
import Button from 'components/button';
import { getPlan } from 'lib/plans';
import { hasFeature } from 'state/sites/plans/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

interface ConnectedProps {
	hasPlanFeature: boolean;
	planTitle: string;
	selectedSiteSlug: string | null;
}

interface ExternalProps {
	buttonText: string;
	feature: string;
	onDefaultButtonClick: () => void;
	onUpgradeButtonClick: () => void;
	planSlug: string;
}

const MarketingToolsFeatureButtonWithPlanGate: FunctionComponent< ExternalProps & ConnectedProps > = ( {
	buttonText,
	hasPlanFeature,
	onDefaultButtonClick,
	onUpgradeButtonClick,
	planSlug,
	planTitle,
	selectedSiteSlug,
} ) => {
	const translate = useTranslate();

	const handleUpgradeClick = () => {
		if ( onUpgradeButtonClick ) {
			onUpgradeButtonClick();
		}

		page( addQueryArgs( { plan: planSlug }, `/plans/${ selectedSiteSlug }` ) );
	};

	if ( hasPlanFeature ) {
		return <Button onClick={ onDefaultButtonClick }>{ buttonText }</Button>;
	}

	return (
		<Button onClick={ handleUpgradeClick }>
			{ translate( 'Upgrade To %(plan)s', {
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
