/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import QueryEligibility from 'components/data/query-atat-eligibility';
import TrackComponentView from 'lib/analytics/track-component-view';

type Translate = typeof import('i18n-calypso').translate;

interface Props {
	// backUrl;
	context: string;
	// eligibilityData;
	// hasBusinessPlan;
	// isEligible;
	// isJetpack;
	// isVip;
	// isPlaceholder;
	// onProceed;
	// onCancel;
	siteId: number;
	// sitePlan;
	// siteSlug;
	translate: Translate;
}

const EligibilityWarningsSimplified = ( props: Props ) => {
	const { context, siteId, translate } = props;

	return (
		<>
			<QueryEligibility siteId={ siteId } />
			<TrackComponentView
				eventName="calypso_automated_transfer_eligibility_show_warnings"
				eventProperties={ { context } }
			/>

			<Card>
				<CardHeading>{ cardHeading( context, translate ) }</CardHeading>
			</Card>
		</>
	);
};

function cardHeading( context: string, translate: Translate ) {
	switch ( context ) {
		case 'plugins':
			return translate( 'To install plugins, you’ll need a couple things:' );
		case 'themes':
			return translate( 'To install themes, you’ll need a couple things:' );
		default:
			return '';
	}
}

export default EligibilityWarningsSimplified;
