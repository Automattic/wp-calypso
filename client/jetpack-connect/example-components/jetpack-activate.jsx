/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import { localize } from 'i18n-calypso';

const JetpackConnectExampleActivate = ( { isInstall, url, translate, onClick } ) => {
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
			<div className="example-components__content example-components__activate-jetpack">
				<div className="example-components__content-wp-admin-masterbar" />
				<div className="example-components__content-wp-admin-sidebar" />
				<div className="example-components__content-wp-admin-main">
					{ isInstall ? (
						<div className="example-components__content-wp-admin-activate-view">
							<div
								className="example-components__content-wp-admin-activate-link"
								aria-hidden="true"
							>
								{ translate( 'Activate Plugin', {
									context: 'Jetpack Connect activate plugin instructions, activate link',
								} ) }
							</div>
						</div>
					) : (
						<div className="example-components__content-wp-admin-plugin-card">
							<div className="example-components__content-wp-admin-plugin-name" aria-hidden="true">
								{ translate( 'Jetpack by WordPress.com', {
									context: 'Jetpack Connect activate plugin instructions, plugin title',
								} ) }
							</div>
							<div
								className="example-components__content-wp-admin-plugin-activate-link"
								aria-hidden="true"
							>
								{ translate( 'Activate', {
									context: 'Jetpack Connect activate plugin instructions, activate link',
								} ) }
							</div>
						</div>
					) }
				</div>
			</div>
		</div>
	);
};

JetpackConnectExampleActivate.propTypes = {
	onClick: PropTypes.func,
};

JetpackConnectExampleActivate.defaultProps = {
	onClick: () => {},
};

export default localize( JetpackConnectExampleActivate );
