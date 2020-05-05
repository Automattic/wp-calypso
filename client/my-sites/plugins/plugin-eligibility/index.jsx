/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import MainComponent from 'components/main';
import HeaderCake from 'components/header-cake';
import EligibilityWarnings from 'blocks/eligibility-warnings';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { initiateThemeTransfer } from 'state/themes/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

class PluginEligibility extends Component {
	static propTypes = {
		pluginSlug: PropTypes.string,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func,
		navigateTo: PropTypes.func,
		initiateTransfer: PropTypes.func,
	};

	getBackUrl = () => {
		const { pluginSlug, siteSlug } = this.props;

		return `/plugins/${ pluginSlug }/${ siteSlug }`;
	};

	goBack = () => this.props.navigateTo( this.getBackUrl() );

	pluginTransferInitiate = () => {
		// Use theme transfer action until we introduce generic ones that will handle both plugins and themes
		this.props.initiateTransfer( this.props.siteId, null, this.props.pluginSlug );
		this.goBack();
	};

	render() {
		const { translate } = this.props;

		return (
			<MainComponent>
				<PageViewTracker path="/plugins/:plugin/eligibility/:site" title="Plugins > Eligibility" />
				<HeaderCake isCompact={ true } onClick={ this.goBack }>
					{ translate( 'Install plugin' ) }
				</HeaderCake>
				<EligibilityWarnings
					onProceed={ this.pluginTransferInitiate }
					backUrl={ this.getBackUrl() }
				/>
			</MainComponent>
		);
	}
}

// It was 2:45AM, I wanted to deploy, and @dmsnell made me do it... props to @dmsnell :)
const withNavigation = ( WrappedComponent ) => ( props ) => (
	<WrappedComponent { ...{ ...props, navigateTo: page } } />
);

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
};

const mapDispatchToProps = {
	initiateTransfer: initiateThemeTransfer,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( withNavigation( localize( PluginEligibility ) ) );
