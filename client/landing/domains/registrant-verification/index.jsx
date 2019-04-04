/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import DomainsLandingHeader from '../header';
import wp from 'lib/wp';
import EmptyContent from '../../../components/empty-content';

/**
 *
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

class RegistrantVerificationPage extends Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		token: PropTypes.string.isRequired,
	};

	state = {
		isLoading: true,
		success: false,
		error: false,
	};

	componentWillMount() {
		const { domain, token } = this.props;
		wpcom.domainsVerifyRegistrantEmail( domain, token ).then(
			data => {
				this.setState( {
					success: data.success,
					error: false,
					isLoading: false,
				} );
			},
			error => {
				this.setState( {
					error: { code: error.error, message: error.message },
					success: false,
					isLoading: false,
				} );
			}
		);
	}

	renderVerificationInProgress = () => {
		return <p>Verifying...</p>;
	};

	handleClickClose = () => {
		window.close();
	};

	renderVerificationSuccess = () => {
		const { translate } = this.props;
		const message = translate(
			'Thank your for verifying your contact information for:{{br /}}{{strong}}%(domain)s{{/strong}}.',
			{
				args: {
					domain: this.props.domain,
				},
				components: {
					strong: <strong />,
					br: <br />,
				},
			}
		);

		return (
			<div className="registrant-verification__success">
				<EmptyContent
					illustration="/calypso/images/illustrations/illustration-ok.svg"
					title={ translate( 'Success!' ) }
					line={ message }
				/>
				<h3>{ translate( '(All done. You can close this window now.)' ) }</h3>
			</div>
		);
	};

	renderVerificationError = () => {
		return <p>{ this.state.error.message }</p>;
	};

	renderVerificationStatus = () => {
		if ( this.state.isLoading ) {
			return this.renderVerificationInProgress();
		}

		if ( this.state.success ) {
			return this.renderVerificationSuccess();
		}

		if ( this.state.error ) {
			return this.renderVerificationError();
		}
	};

	render() {
		const { translate } = this.props;
		return (
			<Fragment>
				<DomainsLandingHeader title={ translate( 'Domain Contact Verification' ) } />
				<CompactCard>{ this.renderVerificationStatus() }</CompactCard>
			</Fragment>
		);
	}
}

export default localize( RegistrantVerificationPage );
