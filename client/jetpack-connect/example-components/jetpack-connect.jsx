import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import FormTextInput from 'calypso/components/forms/form-text-input';

const JetpackConnectExampleConnect = ( { url, translate, onClick } ) => {
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
