/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SitePickerSubmit from './site-picker-submit';
import SiteSelector from 'components/site-selector';
import StepWrapper from 'signup/step-wrapper';

class SitePicker extends Component {
	state = {
		siteSlug: null,
	};

	handleSiteSelect = siteSlug => {
		this.setState( {
			siteSlug,
		} );
	};

	filterSites = site => {
		return site.capabilities.manage_options && ! site.jetpack;
	};

	renderScreen() {
		return (
			<Card className="site-picker__wrapper">
				<SiteSelector filter={ this.filterSites } onSiteSelect={ this.handleSiteSelect } />
			</Card>
		);
	}

	render() {
		if ( this.state.siteSlug ) {
			const { stepSectionName, stepName, goToStep } = this.props;

			return (
				<SitePickerSubmit
					siteSlug={ this.state.siteSlug }
					stepSectionName={ stepSectionName }
					stepName={ stepName }
					goToStep={ goToStep }
				/>
			);
		}

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.headerText }
				fallbackSubHeaderText={ this.props.subHeaderText }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderScreen() }
			/>
		);
	}
}

export default SitePicker;
