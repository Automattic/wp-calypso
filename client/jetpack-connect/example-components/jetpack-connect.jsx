/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTextInput from 'calypso/components/forms/form-text-input';

const JetpackConnectExampleConnect = ( { url, translate, onClick } ) => {
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
						disabled
						placeholder={ url }
					/>
				</div>
			</div>
			<div className="example-components__content example-components__connect-jetpack">
				<div className="example-components__content-wp-admin-masterbar" />
				<div className="example-components__content-wp-admin-sidebar" />
				<div className="example-components__content-wp-admin-main">
					<div className="example-components__content-wp-admin-connect-banner">
						<div className="example-components__content-wp-admin-plugin-name" aria-hidden>
							{ translate( 'Connect Jetpack to WordPress.com' ) }
						</div>
						<div className="example-components__content-wp-admin-connect-button" aria-hidden>
							{ translate( 'Set up Jetpack' ) }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

JetpackConnectExampleConnect.propTypes = {
	onClick: PropTypes.func,
	url: PropTypes.string,
};

JetpackConnectExampleConnect.defaultProps = {
	onClick: () => {},
	url: '',
};

export default localize( JetpackConnectExampleConnect );
