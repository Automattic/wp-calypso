/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

const JetpackConnectExampleConnect = ( { isLegacy, url, translate, onClick } ) => {
	const contentClassName = classNames(
		'example-components__content',
		'example-components__connect-jetpack',
		{
			'is-legacy': isLegacy,
		}
	);
	return (
		<div className="example-components__main" onClick={ onClick }>
			<div className="example-components__browser-chrome example-components__site-url-input-container">
				<div className="example-components__browser-chrome-dots">
					<div className="example-components__browser-chrome-dot" />
					<div className="example-components__browser-chrome-dot" />
					<div className="example-components__browser-chrome-dot" />
				</div>
				<div className="example-components__site-address-container">
					<Gridicon size={ 24 } icon="globe" />
					<FormTextInput
						className="example-components__browser-chrome-url"
						disabled="true"
						placeholder={ url }
					/>
				</div>
			</div>
			<div className={ contentClassName }>
				<div className="example-components__content-wp-admin-masterbar" />
				<div className="example-components__content-wp-admin-sidebar" />
				<div className="example-components__content-wp-admin-main">
					<div className="example-components__content-wp-admin-connect-banner">
						{ ! isLegacy ? (
							<div className="example-components__content-wp-admin-plugin-name" aria-hidden="true">
								{ translate( 'Your Jetpack is almost ready!', {
									context:
										'Jetpack Connect activate plugin instructions, connection banner headline',
								} ) }
							</div>
						) : null }
						<div className="example-components__content-wp-admin-connect-button" aria-hidden="true">
							{ translate( 'Connect to WordPress.com', {
								context:
									'Jetpack Connect post-plugin-activation step, Connect to WordPress.com button',
							} ) }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

JetpackConnectExampleConnect.propTypes = {
	isLegacy: PropTypes.bool,
	onClick: PropTypes.func,
	url: PropTypes.string,
};

JetpackConnectExampleConnect.defaultProps = {
	isLegacy: false,
	onClick: () => {},
	url: '',
};

export default localize( JetpackConnectExampleConnect );
