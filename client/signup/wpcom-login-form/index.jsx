/**
 * External dependencies
 */

import React, { Component } from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:signup:wpcom-login' );

/**
 * Internal dependencies
 */
import config from 'config';

export default class WpcomLoginForm extends Component {
	form = null;

	componentDidMount() {
		debug( 'submit form' );
		this.form.submit();
	}

	action() {
		const subdomainRegExp = /^https?:\/\/([a-z0-9]*).wordpress.com/;
		let subdomain = '';

		if (
			subdomainRegExp.test( this.props.redirectTo ) &&
			config( 'hostname' ) !== 'wpcalypso.wordpress.com' &&
			config( 'hostname' ) !== 'horizon.wordpress.com'
		) {
			subdomain = this.props.redirectTo.match( subdomainRegExp )[ 1 ] + '.';
		}

		return `https://${ subdomain }wordpress.com/wp-login.php`;
	}

	renderExtraFields() {
		const { extraFields } = this.props;

		if ( ! extraFields ) {
			return null;
		}

		return (
			<div>
				{ Object.keys( extraFields ).map( ( field ) => {
					return (
						<input key={ field } type="hidden" name={ field } value={ extraFields[ field ] } />
					);
				} ) }
			</div>
		);
	}

	storeFormRef = ( form ) => {
		this.form = form;
	};

	render() {
		return (
			<form method="post" action={ this.action() } ref={ this.storeFormRef }>
				<input type="hidden" name="log" value={ this.props.log } />
				<input type="hidden" name="pwd" value={ this.props.pwd } />
				<input type="hidden" name="authorization" value={ this.props.authorization } />
				<input type="hidden" name="redirect_to" value={ this.props.redirectTo } />
				{ this.renderExtraFields() }
			</form>
		);
	}
}
