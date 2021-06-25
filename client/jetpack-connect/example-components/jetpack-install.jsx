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

const JetpackConnectExampleInstall = ( { url, translate, onClick } ) => {
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
			<div className="example-components__content example-components__install-jetpack">
				<div className="example-components__install-plugin-header" />
				<div className="example-components__install-plugin-body" />
				<div className="example-components__install-plugin-footer">
					<div className="example-components__install-plugin-footer-button" aria-hidden>
						{ translate( 'Install Now', {
							context: 'Jetpack Connect install plugin instructions, install button',
						} ) }
					</div>
				</div>
			</div>
		</div>
	);
};

JetpackConnectExampleInstall.propTypes = {
	onClick: PropTypes.func,
};

JetpackConnectExampleInstall.defaultProps = {
	onClick: () => {},
};

export default localize( JetpackConnectExampleInstall );
