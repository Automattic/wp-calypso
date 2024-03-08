import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import wpcom from 'calypso/lib/wp';
import { actionType, noticeType } from './constants';
import DomainConnectAuthorizeDescription from './domain-connect-authorize-description';
import DomainConnectAuthorizeFooter from './domain-connect-authorize-footer';
import DomainConnectAuthorizeRecords from './domain-connect-authorize-records';

import './domain-connect-authorize.scss';

class DomainConnectAuthorize extends Component {
	static propTypes = {
		providerId: PropTypes.string.isRequired,
		serviceId: PropTypes.string.isRequired,
	};

	state = {
		action: null,
		dnsTemplateRecordsRetrieved: false,
		dnsTemplateError: false,
		noticeType: null,
	};

	componentDidMount() {
		const { providerId, serviceId, params, translate } = this.props;
		const { domain } = params;

		wpcom.req
			.post( `/domains/${ domain }/dns/providers/${ providerId }/services/${ serviceId }/preview`, {
				variables: params,
			} )
			.then(
				( data ) => {
					this.setState( {
						action: actionType.READY_TO_SUBMIT,
						dnsTemplateConflicts: data && data.conflicting_records,
						dnsTemplateRecords: data && data.new_records,
					} );
				},
				( error ) => {
					const errorMessage =
						error.message ||
						translate(
							"We aren't able to set up the service with the information given. Please check " +
								'with your service provider to make sure they provided all the correct data.'
						);

					this.setState( {
						action: actionType.CLOSE,
						noticeType: noticeType.ERROR,
						noticeMessage: errorMessage,
						dnsTemplateError: true,
					} );
				}
			)
			.then( () => {
				this.setState( {
					dnsTemplateRecordsRetrieved: true,
				} );
			} );
	}

	handleClickConfirm = () => {
		const { providerId, serviceId, params, translate } = this.props;

		this.setState( {
			action: actionType.SUBMITTING,
			noticeType: null,
		} );

		wpcom.req
			.get(
				`/domain-connect/authorize/v2/domainTemplates/providers/${ providerId }/services/${ serviceId }/apply/authorized`,
				{ apiVersion: '1.3', ...params }
			)
			.then(
				( result ) => {
					let action = actionType.CLOSE;
					let noticeMessage = translate( 'Hurray! Your new service is now all set up.' );
					if ( result.redirect_uri ) {
						action = actionType.REDIRECTING;
						noticeMessage = translate(
							"Please wait while we redirect you back to the service provider's site to finalize this update."
						);
						window.location.assign( result.redirect_uri );
					}
					this.setState( {
						action,
						noticeMessage,
						noticeType: noticeType.SUCCESS,
					} );
				},
				( error ) => {
					const errorMessage =
						error.message ||
						translate(
							"We weren't able to add the DNS records needed for this service. Please try again."
						);

					this.setState( {
						action: actionType.READY_TO_SUBMIT,
						noticeMessage: errorMessage,
						noticeType: noticeType.ERROR,
					} );
				}
			);
	};

	handleClickClose = () => {
		window.close();
	};

	renderNotice = () => {
		if ( this.state.noticeType ) {
			return (
				<Notice
					showDismiss={ false }
					status={ this.state.noticeType }
					text={ this.state.noticeMessage }
				/>
			);
		}

		return null;
	};

	render() {
		const { params, translate } = this.props;
		const { domain: rootDomain, host } = params;
		const domain = host ? `${ host }.${ rootDomain }` : rootDomain;

		return (
			<Main className="domain-connect__main">
				<CompactCard>
					<h2>
						{ translate( 'Authorize DNS Changes for %(domain)s', {
							args: { domain: domain },
							comment:
								'%(domain)s is the domain name that we are requesting the user to authorize changes to.',
						} ) }
					</h2>
					<DomainConnectAuthorizeDescription
						dnsTemplateError={ this.state.dnsTemplateError }
						isPlaceholder={ ! this.state.dnsTemplateRecordsRetrieved }
						providerId={ this.props.providerId }
						serviceId={ this.props.serviceId }
					/>
					<DomainConnectAuthorizeRecords
						domain={ domain }
						dnsTemplateRecords={ this.state.dnsTemplateRecords }
						dnsTemplateConflicts={ this.state.dnsTemplateConflicts }
						isPlaceholder={ ! this.state.dnsTemplateRecordsRetrieved }
					/>
					{ this.renderNotice() }
				</CompactCard>
				<CompactCard>
					<DomainConnectAuthorizeFooter
						isPlaceholder={ ! this.state.dnsTemplateRecordsRetrieved }
						onClose={ this.handleClickClose }
						onConfirm={ this.handleClickConfirm }
						showAction={ this.state.action }
					/>
				</CompactCard>
			</Main>
		);
	}
}

export default localize( DomainConnectAuthorize );
