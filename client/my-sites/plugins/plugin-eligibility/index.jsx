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

	getBackUrl = () => {
		const { pluginSlug, siteSlug } = this.props;

		return `/plugins/${ pluginSlug }/${ siteSlug }`;
	};

	goBack = () => page( this.getBackUrl() );

	render() {
		const { translate } = this.props;

		// Mock some errors and warnings until we get real data from the API
		const isEligible = false;

		const errors = [
			{
				title: translate( 'Business plan required' ),
				description: translate( 'Only sites with a business plan can install plugins.' ),
				actionUrl: 'https://en.support.wordpress.com/'
			},
			{
				title: translate( 'Missing custom domain' ),
				description: translate( 'Only sites with custom domain can install plugins.' ),
				actionUrl: 'https://en.support.wordpress.com/'
			}
		];

		const pluginWarnings = [
			{
				title: translate( 'WordPress.com Smileys' ),
				description: translate( 'WordPress.com Smileys will no longer work after this plugin is installed.' ),
				actionUrl: 'https://en.support.wordpress.com/'
			}
		];

		const widgetWarnings = [
			{
				title: translate( 'Authors' ),
				description: translate( 'Authors widget will no longer work after this plugin is installed.' ),
				actionUrl: 'https://en.support.wordpress.com/'
			}
		];

		return (
			<MainComponent>
				<HeaderCake
					isCompact={ true }
					onClick={ this.goBack }
				>
					{ translate( 'Install plugin' ) }
				</HeaderCake>
				<EligibilityWarnings
					isEligible={ isEligible }
					backUrl={ this.getBackUrl() }
					errors={ errors }
					pluginWarnings={ pluginWarnings }
					widgetWarnings={ widgetWarnings }
				/>
			</MainComponent>
		);
	}
}

export default localize( PluginEligibility );
