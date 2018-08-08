/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import BannerItem from './item';
import OnboardingChecklist from 'my-sites/checklist/onboardingChecklist';

export default class ChecklistBanner extends Component {
	render() {
		const { siteId } = this.props;
		return <OnboardingChecklist siteId={ siteId } taskComponentType={ BannerItem } />;

		// Gauge could go to ChecklistHeader (as an alternative to the progress bar there)
	}
}
