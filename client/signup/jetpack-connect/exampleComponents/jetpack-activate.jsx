
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'JetpackConnectExampleActivate',

	renderActivate() {
		if ( this.props.isInstall ) {
			return (
				<div className="jetpack-connect__example-content-wp-admin-activate-view">
					<div className="jetpack-connect__example-content-wp-admin-activate-link" aria-hidden="true">
						{ this.translate( 'Activate Plugin', { context: 'Jetpack Connect activate plugin instructions, activate link' } ) }
					</div>
				</div>
			);
		}
		return (
			<div className="jetpack-connect__example-content-wp-admin-plugin-card">
				<div className="jetpack-connect__example-content-wp-admin-plugin-name" aria-hidden="true">
					{ this.translate( 'Jetpack by WordPress.com', { context: 'Jetpack Connect activate plugin instructions, plugin title' } ) }
				</div>
				<div className="jetpack-connect__example-content-wp-admin-plugin-activate-link" aria-hidden="true">
					{ this.translate( 'Activate', { context: 'Jetpack Connect activate plugin instructions, activate link' } ) }
				</div>
			</div>
		);
	},

	render() {
		return (
			<div className="jetpack-connect__example">
				<div className="jetpack-connect__browser-chrome jetpack-connect__site-url-input-container">
					<div className="jetpack-connect__browser-chrome-dots">
						<div className="jetpack-connect__browser-chrome-dot"></div>
						<div className="jetpack-connect__browser-chrome-dot"></div>
						<div className="jetpack-connect__browser-chrome-dot"></div>
					</div>
					<div className="site-address-container">
						<Gridicon
							size={ 24 }
							icon="globe" />
						<FormTextInput
							className="jetpack-connect__browser-chrome-url"
							disabled="true"
							placeholder={ this.props.url } />
					</div>
				</div>
				<div className="jetpack-connect__example-content jetpack-connect__example-activate-jetpack">
					<div className="jetpack-connect__example-content-wp-admin-masterbar"></div>
					<div className="jetpack-connect__example-content-wp-admin-sidebar"></div>
					<div className="jetpack-connect__example-content-wp-admin-main">
						{ this.renderActivate() }
					</div>
				</div>
			</div>
		);
	}
} );
