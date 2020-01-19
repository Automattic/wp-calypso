/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import EmptyContent from 'components/empty-content';
import FeatureExample from 'components/feature-example';
import { getSiteSlug, getJetpackSiteRemoteManagementUrl } from 'state/sites/selectors';

class JetpackManageErrorPage extends PureComponent {
	static actionCallbacks = {
		updateJetpack: 'actionCallbackUpdate',
		optInManage: 'actionCallbackActivate',
	};

	actionCallbackActivate = () => {
		analytics.ga.recordEvent( 'Jetpack', 'Activate manage', 'Site', this.props.siteId );
	};

	actionCallbackUpdate = () => {
		analytics.ga.recordEvent( 'Jetpack', 'Update jetpack', 'Site', this.props.siteId );
	};

	getSettings() {
		const { remoteManagementUrl, section, siteSlug, template, translate } = this.props;
		const version = this.props.version || '3.4';
		const defaults = {
			updateJetpack: {
				title: translate( 'Your version of Jetpack is out of date.' ),
				line: translate( 'Jetpack %(version)s or higher is required to see this page.', {
					args: { version },
				} ),
				action: translate( 'Update Jetpack' ),
				illustration: null,
				actionURL: '../../plugins/jetpack/' + siteSlug,
				version,
			},
			optInManage: {
				title: translate( 'Looking to manage this site from WordPress.com?' ),
				line: translate(
					'We need you to enable the Manage feature in the Jetpack plugin on your remote site'
				),
				illustration: '/calypso/images/jetpack/jetpack-manage.svg',
				action: translate( 'Enable Jetpack Manage' ),
				actionURL: remoteManagementUrl + ( section ? '&section=' + section : '' ),
				actionTarget: '_blank',
			},
			noDomainsOnJetpack: {
				title: translate( 'Domains are not available for this site.' ),
				line: translate(
					'You can only purchase domains for sites hosted on WordPress.com at this time.'
				),
				action: translate( 'View Plans' ),
				actionURL: '/plans/' + ( siteSlug || '' ),
			},
			default: {},
		};
		return Object.assign( {}, defaults[ template ] || defaults.default, this.props );
	}

	render() {
		const settings = this.getSettings();
		if ( JetpackManageErrorPage.actionCallbacks[ this.props.template ] ) {
			settings.actionCallback = this[
				JetpackManageErrorPage.actionCallbacks[ this.props.template ]
			];
		}
		const featureExample = this.props.featureExample ? (
			<FeatureExample>{ this.props.featureExample }</FeatureExample>
		) : null;

		return (
			<div>
				<EmptyContent { ...settings } />
				{ featureExample }
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteSlug: getSiteSlug( state, siteId ),
	remoteManagementUrl: getJetpackSiteRemoteManagementUrl( state, siteId ),
} ) )( localize( JetpackManageErrorPage ) );
