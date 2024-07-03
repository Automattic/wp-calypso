import { Card } from '@automattic/components';
import { Component } from 'react';
import SiteSelector from 'calypso/components/site-selector';
import StepWrapper from 'calypso/signup/step-wrapper';
import SitePickerSubmit from './site-picker-submit';
import './style.scss';

class SitePicker extends Component {
	state = {
		siteSlug: null,
	};

	handleSiteSelect = ( siteSlug ) => {
		this.setState( {
			siteSlug,
		} );
	};

	filterSites = ( site ) => {
		return site.capabilities?.manage_options && ! site.jetpack && ! site.options?.is_domain_only;
	};

	renderScreen() {
		return (
			<Card className="site-picker__wrapper">
				<SiteSelector
					filter={ this.filterSites }
					onSiteSelect={ this.handleSiteSelect }
					isReskinned={ this.props.isReskinned }
				/>
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
				stepContent={ this.renderScreen() }
			/>
		);
	}
}

export default SitePicker;
