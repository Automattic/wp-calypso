/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { errorNotice } from 'state/notices/actions';
import { Button, CompactCard } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { connect } from 'react-redux';

class TitanControlPanelLoginCard extends React.Component {
	state = {
		isFetchingAutoLoginLink: false,
	};

	fetchTitanAutoLoginURL = ( orderId ) => {
		return new Promise( ( resolve ) => {
			wpcom.undocumented().getTitanControlPanelAutoLoginURL( orderId, ( serverError, result ) => {
				resolve( {
					error: serverError?.message,
					loginURL: serverError ? null : result.auto_login_url,
				} );
			} );
		} );
	};

	onLogInClick = () => {
		if ( this.state.isFetchingAutoLoginLink ) {
			return;
		}

		const { translate } = this.props;
		this.setState( { isFetchingAutoLoginLink: true } );

		// TODO: use actual orderID
		this.fetchTitanAutoLoginURL( 12345 ).then( ( { error, loginURL } ) => {
			this.setState( { isFetchingAutoLoginLink: false } );
			if ( error ) {
				this.props.errorNotice(
					error ?? translate( 'An unknown error occurred. Please try again later.' )
				);
			} else {
				window.location.href = loginURL;
			}
		} );
	};

	render() {
		const { domain, translate } = this.props;
		const translateArgs = {
			args: {
				domainName: domain.name,
			},
			comment: '%(domainName)s is a domain name, e.g. example.com',
		};

		return (
			<div>
				<SectionHeader label={ translate( 'Titan Mail: %(domainName)s', translateArgs ) }>
					<Button
						primary
						compact
						busy={ this.state.isFetchingAutoLoginLink }
						onClick={ this.onLogInClick }
					>
						{ translate( "Log in to Titan's control panel" ) }
					</Button>
				</SectionHeader>
				<CompactCard>
					{ translate(
						"Go to Titan's control panel to manage email for %(domainName)s.",
						translateArgs
					) }
				</CompactCard>
			</div>
		);
	}
}

export default connect( null, ( dispatch ) => {
	return {
		errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
	};
} )( localize( TitanControlPanelLoginCard ) );
