/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

const JetpackConnectExampleInstall = ( { url, translate, onClick } ) => {
	return (
		<div className="example-components__main" onClick={ onClick }>
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
						placeholder={ url } />
				</div>
			</div>
			<div className="example-components__content example-components__install-jetpack">
				<div className="example-components__install-plugin-header"></div>
				<div className="example-components__install-plugin-body"></div>
				<div className="example-components__install-plugin-footer">
					<div className="example-components__install-plugin-footer-button" aria-hidden="true">
						{ translate( 'Install Now',
							{
								context: 'Jetpack Connect install plugin instructions, install button'
							}
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

JetpackConnectExampleInstall.propTypes = {
	onClick: React.PropTypes.func
};

JetpackConnectExampleInstall.defaultProps = {
	onClick: () => {}
};

export default localize( JetpackConnectExampleInstall );
