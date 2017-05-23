/**
 * External dependencies
 */
import React, { Component } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import Main from 'components/main';
import Notice from 'components/notice';
import upgradesActions from 'lib/upgrades/actions';
import DomainConnectAuthorizeDescription from './domain-connect-authorize-description';
import DomainConnectAuthorizeConflicts from './domain-connect-authorize-conflicts';
import DomainConnectAuthorizeFooter from './domain-connect-authorize-footer';
import { actionType, noticeType } from './constants';

class DomainConnectAuthorize extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			action: null,
			dnsTemplateConflictsRetrieved: false,
			noticeType: null
		};
	}

	componentDidMount() {
		const { providerId, params } = this.props,
			{ domain } = params;

		upgradesActions.getDnsTemplateConflicts( domain, providerId, params, ( error, data ) => {
			if ( ! error ) {
				this.setState( {
					action: actionType.READY_TO_SUBMIT,
					dnsTemplateConflicts: data.records,
					dnsTemplateError: false
				} );
			} else {
				const errorMessage = error.message ||
					translate( 'We aren\'t able to set up the service with the information given. Please check ' +
						'with your service provider to make sure they provided all the correct data.' );

				this.setState( {
					action: actionType.CLOSE,
					dnsTemplateError: true,
					noticeType: noticeType.ERROR,
					noticeMessage: errorMessage
				} );
			}

			this.setState( {
				dnsTemplateConflictsRetrieved: true
			} );
		} );
	}

	handleClickConfirm = () => {
		const { providerId, params } = this.props,
			{ domain } = params;

		this.setState( {
			action: actionType.SUBMITTING,
			notice: null
		} );

		upgradesActions.applyDnsTemplate( domain, providerId, params, ( error ) => {
			if ( error ) {
				const errorMessage = error.message ||
					translate( 'We weren\'t able to add the DNS records needed for this service. Please try again.' );

				this.setState( {
					action: actionType.READY_TO_SUBMIT,
					noticeMessage: errorMessage,
					noticeType: noticeType.ERROR
				} );
			} else {
				this.setState( {
					action: actionType.CLOSE,
					noticeMessage: translate( 'Horray! Your new service is now all set up.' ),
					noticeType: noticeType.SUCCESS
				} );
			}
		} );
	}

	handleClickClose = () => {
		window.close();
	}

	renderNotice = () => {
		if ( this.state.noticeType ) {
			return (
				<Notice
					showDismiss={ false }
					status={ this.state.noticeType }
					text={ this.state.noticeMessage }>
				</Notice>
			);
		}

		return null;
	}

	render() {
		const { domain } = this.props.params;

		return (
			<Main className="domain-connect__main">
				<Card>
					<h2>
						{
							translate( 'Authorize DNS Changes for %(domain)s',
								{
									args: { domain: domain },
									comment: '%(domain)s is the domain name that we are requesting the user to authorize changes to.'
								}
							)
						}
					</h2>
					<DomainConnectAuthorizeDescription
						isPlaceholder={ ! this.state.dnsTemplateConflictsRetrieved }
						providerId={ this.props.providerId } />
					<DomainConnectAuthorizeConflicts
						conflictingRecords= { this.state.dnsTemplateConflicts }
						isPlaceholder={ ! this.state.dnsTemplateConflictsRetrieved } />
					{ this.renderNotice() }
					<DomainConnectAuthorizeFooter
						isPlaceholder={ ! this.state.dnsTemplateConflictsRetrieved }
						onClose={ this.handleClickClose }
						onConfirm={ this.handleClickConfirm }
						showAction={ this.state.action } />
				</Card>
			</Main>
		);
	}
}

export default DomainConnectAuthorize;
