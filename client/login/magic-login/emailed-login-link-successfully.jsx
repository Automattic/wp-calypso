import page from '@automattic/calypso-router';
import { Card, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import { preventWidows } from 'calypso/lib/formatting/prevent-widows';
import { login } from 'calypso/lib/paths';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { hideMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { withEnhancers } from 'calypso/state/utils';

class EmailedLoginLinkSuccessfully extends Component {
	static propTypes = {
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		locale: PropTypes.string.isRequired,
		recordPageView: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.recordPageView( '/log-in/link', 'Login > Link > Emailed' );
	}

	onClickBackLink = ( event ) => {
		event.preventDefault();

		this.props.hideMagicLoginRequestForm();

		page(
			login( {
				isJetpack: this.props.isJetpackLogin,
				isWhiteLogin: this.props.isWhiteLogin,
				locale: this.props.locale,
			} )
		);
	};

	render() {
		const { translate, emailAddress } = this.props;
		const line = [
			emailAddress
				? translate( 'We just emailed a link to %(emailAddress)s.', {
						args: {
							emailAddress,
						},
				  } )
				: translate( 'We just emailed you a link.' ),
			' ',
			translate( 'Please check your inbox and click the link to log in.' ),
		];

		return (
			<div>
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation={ true }
					waitForEmailAddress={ emailAddress }
				/>

				<h1 className="magic-login__form-header">{ translate( 'Check your email!' ) }</h1>

				<Card className="magic-login__form">
					<p>{ preventWidows( line ) }</p>
				</Card>

				<div className="magic-login__footer">
					<a
						href={ login( {
							isJetpack: this.props.isJetpackLogin,
							isWhiteLogin: this.props.isWhiteLogin,
							locale: this.props.locale,
						} ) }
						onClick={ this.onClickBackLink }
					>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Back to login' ) }
					</a>
				</div>
			</div>
		);
	}
}

const mapState = ( state ) => ( {
	locale: getCurrentLocaleSlug( state ),
	isJetpackLogin: getCurrentRoute( state ) === '/log-in/jetpack/link',
	isWhiteLogin: getCurrentRoute( state )?.startsWith( '/log-in/new/link' ),
} );

const mapDispatch = {
	hideMagicLoginRequestForm,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( EmailedLoginLinkSuccessfully ) );
