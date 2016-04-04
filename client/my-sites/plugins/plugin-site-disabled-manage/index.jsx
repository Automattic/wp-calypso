/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import Button from 'components/button';
import DisconnectJetpackButton from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button';
import { getJetpackSiteRemoteManagementUrl } from 'state/sites/selectors';

const PluginSiteDisabledManage = React.createClass( {

	render: function() {
		const message = this.props.isNetwork ?
				this.translate( 'Network management disabled' ) :
				this.translate( 'Management disabled' ),
			url = this.props.siteRemoteManagementUrl + '&section=plugins';

		if ( this.props.plugin.slug === 'jetpack' ) {
			return (
				<span className="plugin-site-disabled-manage">
					<span className="plugin-site-disabled-manage__label">{ message }</span>
					<DisconnectJetpackButton disabled={ ! this.props.plugin } site={ this.props.site } redirect="/plugins/jetpack" />
				</span>
			);
		}
		return (
			<span className="plugin-site-disabled-manage">
				<span className="plugin-site-disabled-manage__label">{ message }</span>
				<Button compact={ true } className="plugin-site-disabled-manage__link" href={ url } onClick={ analytics.ga.recordEvent.bind( analytics, 'Jetpack Manage', 'Clicked Enable Jetpack Manage Link' ) }> { this.translate( 'Enable' ) } </Button>
			</span>
		);
	}
} );

export default connect(
	( state, props ) => ( {
		siteRemoteManagementUrl: getJetpackSiteRemoteManagementUrl( state, props.site.ID )
	} )
)( PluginSiteDisabledManage );
