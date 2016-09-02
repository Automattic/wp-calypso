/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'JetpackConnectExampleConnect',

	propTypes: {
		isLegacy: React.PropTypes.bool,
		url: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			isLegacy: false,
			url: ''
		};
	},

	render() {
		const contentClassName = classNames( 'jetpack-connect__example-content', 'jetpack-connect__example-connect-jetpack', {
			'is-legacy': this.props.isLegacy
		} );
		return (
			<div className="jetpack-connect__example">
				<div className="jetpack-connect__browser-chrome jetpack-connect__site-url-input-container">
					<div className="jetpack-connect__browser-chrome-dots">
						<div className="jetpack-connect__browser-chrome-dot"></div>
						<div className="jetpack-connect__browser-chrome-dot"></div>
						<div className="jetpack-connect__browser-chrome-dot"></div>
					</div>
					<div className="jetpack-connect__site-address-container">
						<Gridicon
							size={ 24 }
							icon="globe" />
						<FormTextInput
							className="jetpack-connect__browser-chrome-url"
							disabled="true"
							placeholder={ this.props.url } />
					</div>
				</div>
				<div className={ contentClassName }>
					<div className="jetpack-connect__example-content-wp-admin-masterbar"></div>
					<div className="jetpack-connect__example-content-wp-admin-sidebar"></div>
					<div className="jetpack-connect__example-content-wp-admin-main">
						<div className="jetpack-connect__example-content-wp-admin-connect-banner">
							{ ! this.props.isLegacy
								? (
									<div className="jetpack-connect__example-content-wp-admin-plugin-name" aria-hidden="true">
										{ this.translate( 'Your Jetpack is almost ready!',
											{
												context: 'Jetpack Connect activate plugin instructions, connection banner headline'
											}
										) }
									</div>
								)
								: null
							}
							<div className="jetpack-connect__example-content-wp-admin-connect-button" aria-hidden="true">
								{ this.translate( 'Connect to WordPress.com',
									{
										context: 'Jetpack Connect post-plugin-activation step, Connect to WordPress.com button'
									}
								) }
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
} );
