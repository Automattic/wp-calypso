import React from 'react';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'JetpackConnectExampleConnect',

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
				<div className="jetpack-connect__example-content jetpack-connect__example-connect-jetpack">
					<div className="jetpack-connect__example-content-wp-admin-masterbar"></div>
					<div className="jetpack-connect__example-content-wp-admin-sidebar"></div>
					<div className="jetpack-connect__example-content-wp-admin-main">
						<div className="jetpack-connect__example-content-wp-admin-connect-banner">
							<div className="jetpack-connect__example-content-wp-admin-connect-button" aria-hidden="true">
								{ this.translate( 'Connect to WordPress.com', { context: 'Jetpack Connect post-plugin-activation step, Connect to WordPress.com button' } ) }
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
} );
