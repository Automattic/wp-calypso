/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import page from 'page';
import { get } from 'lodash';
import { parse } from 'qs';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Notice from 'components/notice';
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/domains/domain-management/components/header';
import Main from 'components/main';
import Button from 'components/button';
import { domainManagementEdit, domainManagementDomainConnectMapping } from 'my-sites/domains/paths';
import { getSelectedDomain } from 'lib/domains';
import SectionHeader from 'components/section-header';
import wp from 'lib/wp';
import { externalRedirect } from 'lib/route';

const wpcom = wp.undocumented();

class DomainConnectMapping extends React.Component {
	static propTypes = {
		domains: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	state = {
		submitting: false,
		error: null,
	};

	getRedirectUriStatusString = () => {
		return 'domain-connect-complete-' + this.props.selectedDomainName.replace( '.', '-' );
	};

	isDomainConnectComplete = () => {
		const queryObject = parse( window.location.search.replace( '?', '' ) );
		const status = get( queryObject, 'status', null );
		return status === this.getRedirectUriStatusString();
	};

	renderErrorNotice = () => {
		if ( ! this.state.error ) {
			return;
		}

		const { translate } = this.props;

		return (
			<Notice status="is-error" icon="notice" onDismissClick={ this.dismissNotice }>
				{ translate(
					'An error occured while redirecting to your domain provider. ' +
						'If the issue persists please contact our support staff.'
				) }
			</Notice>
		);
	};

	renderSuccessNotice = () => {
		if ( ! this.isDomainConnectComplete() || this.state.error ) {
			return;
		}

		const { translate } = this.props;

		return (
			<Notice status="is-success" icon="checkmark" showDismiss={ false }>
				{ translate(
					'Your domain is now configured to work with WordPress.com. ' +
						'Please note that there may be a delay before the new settings ' +
						'take effect at your domain provider.'
				) }
			</Notice>
		);
	};

	render() {
		const { translate } = this.props;

		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToDomainManagementEdit } />;
		}

		return (
			<Main className="domain-connect-mapping">
				<Header
					onClick={ this.goToDomainManagementEdit }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ translate( 'Connect Your Domain' ) }
				</Header>
				{ this.renderErrorNotice() }
				{ this.renderSuccessNotice() }
				<div>
					<SectionHeader label={ translate( 'Connect Your Domain' ) } />
					<Card>
						<div>
							<p>
								{ translate(
									'Your domain provider supports automattically configuring your ' +
										'domain to use it with WordPress.com.'
								) }
							</p>
							<p>
								{ translate(
									'Clicking the button below redirects you to your domain provider ' +
										'where you may be asked to log in. Once you confirm your ' +
										'settings and the process is complete, your domain will be ' +
										'connected to your WordPress.com site and you will be redirected ' +
										'back to WordPress.com.'
								) }
							</p>
							<Button
								className="domain-connect-mapping__action-button"
								onClick={ this.applyDomainConnectMappingTemplate }
								primary
								busy={ this.state.submitting }
								disabled={ this.state.submitting }
							>
								{ translate( 'Configure Your Domain Settings' ) }
							</Button>
						</div>
					</Card>
				</div>
			</Main>
		);
	}

	isDataLoading = () => {
		return ! getSelectedDomain( this.props );
	};

	dismissNotice = () => {
		this.setState( { error: null } );
	};

	applyDomainConnectMappingTemplate = () => {
		this.setState( { submitting: true } );

		const redirectUri =
			'https://wordpress.com' +
			domainManagementDomainConnectMapping(
				this.props.selectedSite.slug,
				this.props.selectedDomainName
			) +
			'?' +
			this.getRedirectUriStatusString();

		wpcom
			.getDomainConnectSyncUxUrl(
				this.props.selectedDomainName,
				'WordPress.com',
				'hosting',
				redirectUri
			)
			.then(
				data => {
					const success = get( data, 'success', false );
					const syncUxUrl = get( data, 'sync_ux_apply_url', null );
					if ( success && syncUxUrl ) {
						externalRedirect( syncUxUrl );
					} else {
						this.setState( {
							error: true,
							submitting: false,
						} );
					}
				},
				() => {
					this.setState( {
						error: true,
						submitting: false,
					} );
				}
			);
	};

	goToDomainManagementEdit = () => {
		page( domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};
}

export default localize( DomainConnectMapping );
