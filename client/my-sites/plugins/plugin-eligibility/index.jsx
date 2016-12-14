/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import MainComponent from 'components/main';
import HeaderCake from 'components/header-cake';
import EligibilityWarnings from '../eligibility-warnings';

class PluginEligibility extends Component {

	static propTypes = {
		pluginSlug: PropTypes.string,
		siteSlug: PropTypes.string,
		translate: PropTypes.func,
	};

	goBack = () => {
		const { pluginSlug, siteSlug } = this.props;

		page( `/plugins/${ pluginSlug }/${ siteSlug }` );
	};

	render() {
		const { translate } = this.props;

		return (
			<MainComponent>
				<HeaderCake
					isCompact={ true }
					onClick={ this.goBack }
				>
					{ translate( 'Install plugin' ) }
				</HeaderCake>
				<EligibilityWarnings />
			</MainComponent>
		);
	}
}

export default localize( PluginEligibility );
