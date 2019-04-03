/**
 * External dependencies
 */
import React, { Component } from 'react';
import RenderDom from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Main from 'components/main';
import wp from 'lib/wp';

/**
 *
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

class RegistrantVerificationPage extends Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		token: PropTypes.string.isRequired,
	};

	componentWillMount() {
		const { domain, token } = this.props;
		wpcom.domainsVerifyRegistrantEmail( domain, token ).then(
			data => {
				console.log( data );
			},
			err => {
				console.log( err );
			}
		);
	}

	render() {
		return (
			<Main className="registrant-verification">
				<CompactCard>
					<h2>{ 'Verify your contact information' }</h2>
				</CompactCard>
				<CompactCard>
					<p>Maybe you're verified...maybe not...can't tell yet.</p>
				</CompactCard>
			</Main>
		);
	}
}

function getUrlParameter( name ) {
	name = name.replace( /[[]/, '\\[' ).replace( /[\]]/, '\\]' );
	const regex = new RegExp( '[\\?&]' + name + '=([^&#]*)' );
	const results = regex.exec( location.search );
	return results === null ? '' : decodeURIComponent( results[ 1 ].replace( /\+/g, ' ' ) );
}

/**
 * Default export. Boots up the landing page.
 */
function boot() {
	const token = getUrlParameter( 'token' );
	const domain = getUrlParameter( 'domain' );
	RenderDom.render(
		<RegistrantVerificationPage token={ token } domain={ domain } />,
		document.getElementById( 'primary' )
	);
}

boot();
