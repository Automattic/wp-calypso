import config from '@automattic/calypso-config';
import debugFactory from 'debug';
import { Component, createRef } from 'react';

const debug = debugFactory( 'calypso:signup:wpcom-login' );

function getFormAction( redirectTo ) {
	const subdomainRegExp = /^https?:\/\/([a-z0-9]+)\.wordpress\.com(?:$|\/)/;
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
	constructor( props ) {
		super( props );
		this.form = createRef();
	}

	componentDidMount() {
		debug( 'submit form' );
		this.form.current.submit();
	}

	renderExtraFields() {
		const { extraFields } = this.props;

		if ( ! extraFields ) {
			return null;
		}

		return Object.entries( extraFields ).map( ( [ field, value ] ) => (
			<input key={ field } type="hidden" name={ field } value={ value } />
		) );
	}

	render() {
		const { redirectTo } = this.props;

		return (
			<form method="post" action={ getFormAction( redirectTo ) } ref={ this.form }>
				<input type="hidden" name="log" value={ this.props.log } />
				<input type="hidden" name="pwd" value={ this.props.pwd } />
				<input type="hidden" name="authorization" value={ this.props.authorization } />
				<input type="hidden" name="redirect_to" value={ this.props.redirectTo } />
				{ this.renderExtraFields() }
			</form>
		);
	}
}
