/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { login } from 'lib/paths';
import EmptyContent from 'components/empty-content';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';
import { hideMagicLoginRequestForm } from 'state/login/magic-login/actions';
import { recordPageViewWithClientId as recordPageView } from 'state/analytics/actions';
import urlModule from 'url';

const nativeLoginUrl = login( { isNative: true, twoFactorAuthType: 'link' } );

// @TODO: Figure out why this failed as an import
// import { addQueryArgs } from 'lib/route';
// TypeError: (0 , _route.addQueryArgs) is not a function
// Seems like it could be SSR related?
const addQueryArgs = ( args, url ) => {
	if ( 'object' !== typeof args ) {
		throw new Error( 'addQueryArgs expects the first argument to be an object.' );
	}

	if ( 'string' !== typeof url ) {
		throw new Error( 'addQueryArgs expects the second argument to be a string.' );
	}

	// Remove any undefined query args
	args = pickBy( args, arg => arg != null );

	// Build new query object for url
	const parsedUrl = urlModule.parse( url, true );
	let query = parsedUrl.query || {};
	query = Object.assign( query, args );

	// Build new url object
	//
	// Note: we set search to false here to that our query object is processed
	const updatedUrlObject = Object.assign( parsedUrl, {
		query,
		search: false,
	} );

	return urlModule.format( updatedUrlObject );
};

const lostPasswordURL = addQueryArgs(
	{
		action: 'lostpassword',
	},
	login()
);

class EmailedLoginLinkExpired extends React.Component {
	static propTypes = {
		recordPageView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	onClickTryAgainLink = event => {
		event.preventDefault();

		this.props.hideMagicLoginRequestForm();

		page( nativeLoginUrl );
	};

	render() {
		const { translate } = this.props;

		this.props.recordPageView( '/log-in/link/use', 'Login > Link > Expired' );

		return (
			<div>
				<RedirectWhenLoggedIn
					delayAtMount={ 3500 }
					redirectTo="/"
					replaceCurrentLocation={ true }
				/>
				<EmptyContent
					action={ translate( 'Try again' ) }
					actionCallback={ this.onClickTryAgainLink }
					actionURL={ nativeLoginUrl }
					className="magic-login__link-expired"
					illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					illustrationWidth={ 500 }
					line={ translate( 'Maybe try resetting your password instead' ) }
					secondaryAction={ translate( 'Reset my password' ) }
					secondaryActionURL={ lostPasswordURL }
					title={ translate( 'Login link is expired or invalid' ) }
				/>
			</div>
		);
	}
}

const mapDispatchToProps = {
	hideMagicLoginRequestForm,
	recordPageView,
};

export default connect( null, mapDispatchToProps )( localize( EmailedLoginLinkExpired ) );
