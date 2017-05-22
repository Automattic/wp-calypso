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
			noticeType: null,
			dnsTemplateConflictsRetrieved: false
		};
	}

	componentDidMount() {
		const { providerId, params } = this.props,
			{ domain } = params;

		upgradesActions.getDnsTemplateConflicts( domain, providerId, params, ( error, data ) => {
			if ( ! error ) {
				this.setState( {
					dnsTemplateConflicts: data.records,
					dnsTemplateError: false,
					action: actionType.READY_TO_SUBMIT
				} );
			} else {
				const errorMessage = error.message ||
					translate( 'We aren\'t able to set up the service with the information given. Please check ' +
						'with your service provider to make sure they provided all the correct data.' );

				this.setState( {
					noticeType: noticeType.ERROR,
					noticeMessage: errorMessage,
					dnsTemplateError: true,
					action: actionType.CLOSE
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
					noticeType: noticeType.ERROR,
					noticeMessage: errorMessage
				} );
			} else {
				this.setState( {
					action: actionType.CLOSE,
					noticeType: noticeType.SUCCESS,
					noticeMessage: translate( 'Horray! Your new service is now all set up.' )
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
					status={ this.state.noticeType }
					showDismiss={ false }
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
						isPlaceholder={ ! this.state.dnsTemplateConflictsRetrieved }
						conflictingRecords= { this.state.dnsTemplateConflicts } />
					{ this.renderNotice() }
					<DomainConnectAuthorizeFooter
						isPlaceholder={ ! this.state.dnsTemplateConflictsRetrieved }
						showAction={ this.state.action }
						onConfirm={ this.handleClickConfirm }
						onClose={ this.handleClickClose } />
				</Card>
			</Main>
		);
	}
}

export default DomainConnectAuthorize;
