
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
				<div className="jetpack-connect__example-content-wp-admin-plugin-card">
					<div className="jetpack-connect__example-content-wp-admin-plugin-name">{ this.translate( 'Jetpack by WordPress.com' ) }</div>
					<div className="jetpack-connect__example-content-wp-admin-plugin-activate-link">{ this.translate( 'Activate' ) }</div>
				</div>
			);
		}
		return (
			<div className="jetpack-connect__example-content-wp-admin-activate-view">
				<div className="jetpack-connect__example-content-wp-admin-activate-link">{ this.translate( 'Activate Plugin' ) }</div>
			</div>
		);
	},

	render() {
		return (
			<div className="jetpack-connect__example">
				<div className="jetpack-connect__browser-chrome jetpack-connect__site-url-input-container">
					<div className="jetpack-connect__browser-chrome-dot"></div>
					<div className="jetpack-connect__browser-chrome-dot"></div>
					<div className="jetpack-connect__browser-chrome-dot"></div>

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
				<div className="jetpack-connect__example-content jetpack-connect__example-connect-jetpack">
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
