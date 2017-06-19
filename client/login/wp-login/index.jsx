/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { startCase } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import LoginLinks from './login-links';
import Main from 'components/main';
import LocaleSuggestions from 'components/locale-suggestions';
import LoginBlock from 'blocks/login';
import { recordPageView } from 'state/analytics/actions';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';

export class Login extends React.Component {
	static propTypes = {
		locale: PropTypes.string.isRequired,
		path: PropTypes.string.isRequired,
		recordPageView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
	};

	componentDidMount() {
		this.recordPageView( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.twoFactorAuthType !== nextProps.twoFactorAuthType ) {
			this.recordPageView( nextProps );
		}
	}

	recordPageView( props ) {
		const { twoFactorAuthType } = props;

		let url = '/log-in';
		let title = 'Login';

		if ( twoFactorAuthType ) {
			url += `/${ twoFactorAuthType }`;
			title += ` > Two-Step Authentication > ${ startCase( twoFactorAuthType ) }`;
		}

		this.props.recordPageView( url, title );
	}

	renderLocaleSuggestions() {
		const { locale, path, twoFactorAuthType } = this.props;

		if ( twoFactorAuthType ) {
			return null;
		}

		return <LocaleSuggestions locale={ locale } path={ path } />;
	}

	renderFooter() {
		return (
			<div className="wp-login__jetpack-footer">
				<img src="/calypso/images/jetpack/powered-by-jetpack.svg" alt="Powered by Jetpack" />
			</div>
		);
	}

	render() {
		const { translate, twoFactorAuthType } = this.props;

		return (
			<div>
				<Main className="wp-login__main">
					{ this.renderLocaleSuggestions() }

					<DocumentHead title={ translate( 'Log In', { textOnly: true } ) } />

					<GlobalNotices id="notices" notices={ notices.list } />

					<div>
						<div className="wp-login__container">
							<LoginBlock
								twoFactorAuthType={ twoFactorAuthType }
								title={ translate( 'Log in to your account.' ) }
							/>
						</div>

						<LoginLinks twoFactorAuthType={ twoFactorAuthType } />
					</div>
				</Main>

				{ this.renderFooter() }
			</div>
		);
	}
}

const mapDispatch = {
	recordPageView,
};

export default connect( null, mapDispatch )( localize( Login ) );
