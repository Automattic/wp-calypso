/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import MainComponent from 'components/main';
import HeaderCake from 'components/header-cake';
import EligibilityWarnings from 'blocks/eligibility-warnings';

class PluginEligibility extends Component {
	static propTypes = {
		pluginSlug: PropTypes.string,
		siteSlug: PropTypes.string,
		translate: PropTypes.func,
		navigateTo: PropTypes.func
	};

	getBackUrl = () => {
		const { pluginSlug, siteSlug } = this.props;

		return `/plugins/${ pluginSlug }/${ siteSlug }`;
	};

	goBack = () => this.props.navigateTo( this.getBackUrl() );

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
				<EligibilityWarnings
					// TODO: Replace with transfer initiate call
					onProceed={ noop }
					backUrl={ this.getBackUrl() }
				/>
			</MainComponent>
		);
	}
}

// It was 2:45AM, I wanted to deploy, and @dmsnell made me do it... props to @dmsnell :)
const withNavigation = WrappedComponent => props => <WrappedComponent { ...{ ...props, navigateTo: page } } />;

export default withNavigation( localize( PluginEligibility ) );
