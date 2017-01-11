/**
 * External dependencies
 */
import React from 'react'
import { connect } from 'react-redux'

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics'
import EmptyContent from 'components/empty-content'
import FeatureExample from 'components/feature-example'
import { getSiteSlug, getJetpackSiteRemoteManagementUrl } from 'state/sites/selectors'

const JetpackManageErrorPage = React.createClass( {

	mixins: [ 'pluginsData' ],

	actionCallbacks: {
		updateJetpack: 'actionCallbackUpdate',
		optInManage: 'actionCallbackActivate'
	},

	actionCallbackActivate() {
		analytics.ga.recordEvent( 'Jetpack', 'Activate manage', 'Site', this.props.site ? this.props.site.ID : null );
	},

	actionCallbackUpdate() {
		analytics.ga.recordEvent( 'Jetpack', 'Update jetpack', 'Site', this.props.site ? this.props.site.ID : null );
	},

	getSettings() {
		const version = this.props.version || '3.4';
		const defaults = {
			updateJetpack: {
				title: this.translate( 'Your version of Jetpack is out of date.' ),
				line: this.translate( 'Jetpack %(version)s or higher is required to see this page.', { args: { version: version } } ),
				action: this.translate( 'Update Jetpack' ),
				illustration: null,
				actionURL: '../../plugins/jetpack/' + this.props.siteSlug,
				version: version
			},
			optInManage: {
				title: this.translate( 'Looking to manage this site from WordPress.com?' ),
				line: this.translate( 'We need you to enable the Manage feature in the Jetpack plugin on your remote site' ),
				illustration: '/calypso/images/jetpack/jetpack-manage.svg',
				action: this.translate( 'Enable Jetpack Manage' ),
				actionURL: this.props.remoteManagementUrl + ( this.props.section ? '&section=' + this.props.section : '' ),
				actionTarget: '_blank'
			},
			noDomainsOnJetpack: {
				title: this.translate( 'Domains are not available for this site.' ),
				line: this.translate( 'You can only purchase domains for sites hosted on WordPress.com at this time.' ),
				action: this.translate( 'View Plans' ),
				actionURL: '/plans/' + ( this.props.siteSlug || '' )
			},
			'default': {}
		};
		return Object.assign( {}, defaults[ this.props.template ] || defaults.default, this.props );
	},

	render() {
		const settings = this.getSettings();
		if ( this.actionCallbacks[ this.props.template ] ) {
			settings.actionCallback = this[ this.actionCallbacks[ this.props.template ] ];
		}
		const emptyContent = React.createElement( EmptyContent, settings );
		const featureExample = this.props.featureExample
			? <FeatureExample>{ this.props.featureExample }</FeatureExample>
			: null;

		return (
			<div>
				{ emptyContent }
				{ featureExample }
			</div>
		);
	}

} );

export default connect(
	( state, { site } ) => ( {
		siteSlug: getSiteSlug( state, site.ID ),
		remoteManagementUrl: getJetpackSiteRemoteManagementUrl( state, site.ID )
	} )
)( JetpackManageErrorPage );
