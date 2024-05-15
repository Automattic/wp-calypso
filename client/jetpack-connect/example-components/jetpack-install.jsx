import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import FormTextInput from 'calypso/components/forms/form-text-input';

const JetpackConnectExampleInstall = ( { url, translate, onClick } ) => {
	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
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
