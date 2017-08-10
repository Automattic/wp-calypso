/**
 * External Dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import QueryPlans from 'components/data/query-plans';
import PlanCompareCard from 'my-sites/plan-compare-card';
import PlanCompareCardItem from 'my-sites/plan-compare-card/item';
import TrackComponentView from 'lib/analytics/track-component-view';
import formatCurrency from 'lib/format-currency';
import { preventWidows } from 'lib/formatting';
import { getFeatureTitle, getPlan } from 'lib/plans';
import { getPlanBySlug } from 'state/plans/selectors';
import { PLAN_PERSONAL } from 'lib/plans/constants';
import { getSitePlan } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class JITM extends Component {
	render() {
		return <p>Hello World</p>;
	}
}

export default JITM;
