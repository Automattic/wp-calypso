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
		const contentClassName = classNames( 'example-components__content', 'example-components__connect-jetpack', {
			'is-legacy': this.props.isLegacy
		} );
		return (
			<div className="example-components__main">
				<div className="example-components__browser-chrome example-components__site-url-input-container">
					<div className="example-components__browser-chrome-dots">
						<div className="example-components__browser-chrome-dot"></div>
						<div className="example-components__browser-chrome-dot"></div>
						<div className="example-components__browser-chrome-dot"></div>
					</div>
					<div className="example-components__site-address-container">
						<Gridicon
							size={ 24 }
							icon="globe" />
						<FormTextInput
							className="example-components__browser-chrome-url"
							disabled="true"
							placeholder={ this.props.url } />
					</div>
				</div>
				<div className={ contentClassName }>
					<div className="example-components__content-wp-admin-masterbar"></div>
					<div className="example-components__content-wp-admin-sidebar"></div>
					<div className="example-components__content-wp-admin-main">
						<div className="example-components__content-wp-admin-connect-banner">
							{ ! this.props.isLegacy
								? (
									<div className="example-components__content-wp-admin-plugin-name" aria-hidden="true">
										{ this.translate( 'Your Jetpack is almost ready!',
											{
												context: 'Jetpack Connect activate plugin instructions, connection banner headline'
											}
										) }
									</div>
								)
								: null
							}
							<div className="example-components__content-wp-admin-connect-button" aria-hidden="true">
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
