import config from '@automattic/calypso-config';
import debugFactory from 'debug';
import { Component } from 'react';

const debug = debugFactory( 'calypso:signup:wpcom-login' );

function getFormAction( redirectTo ) {
	const subdomainRegExp = /^https?:\/\/([a-z0-9]*).wordpress.com/;
	const hostname = config( 'hostname' );
	let subdomain = '';

	if (
		subdomainRegExp.test( redirectTo ) &&
		hostname !== 'wpcalypso.wordpress.com' &&
		hostname !== 'horizon.wordpress.com'
	) {
		subdomain = redirectTo.match( subdomainRegExp )[ 1 ] + '.';
	}

	return `https://${ subdomain }wordpress.com/wp-login.php`;
}

export default class WpcomLoginForm extends Component {
	form = null;

	componentDidMount() {
		debug( 'submit form' );
		this.form.submit();
	}

	renderExtraFields() {
		const { extraFields } = this.props;

		if ( ! extraFields ) {
			return null;
		}

		return Object.keys( extraFields ).map( ( field ) => (
			<input key={ field } type="hidden" name={ field } value={ extraFields[ field ] } />
		) );
	}

	storeFormRef = ( form ) => {
		this.form = form;
	};

	render() {
		const { redirectTo } = this.props;

		return (
			<form method="post" action={ getFormAction( redirectTo ) } ref={ this.storeFormRef }>
				<input type="hidden" name="log" value={ this.props.log } />
				<input type="hidden" name="pwd" value={ this.props.pwd } />
				<input type="hidden" name="authorization" value={ this.props.authorization } />
				<input type="hidden" name="redirect_to" value={ this.props.redirectTo } />
				{ this.renderExtraFields() }
			</form>
		);
	}
}
