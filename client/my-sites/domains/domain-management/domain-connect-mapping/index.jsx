import page from '@automattic/calypso-router';
import { Card, Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import SectionHeader from 'calypso/components/section-header';
import { getSelectedDomain } from 'calypso/lib/domains';
import { navigate } from 'calypso/lib/navigate';
import wp from 'calypso/lib/wp';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import {
	domainManagementEdit,
	domainManagementDomainConnectMapping,
} from 'calypso/my-sites/domains/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

class DomainConnectMapping extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
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
		const status = queryObject?.status;
		const redirectUriStatusString = this.getRedirectUriStatusString();

		// Some domain providers return the status string as a key rather than the value of
		// the `status` variable in the query string, so we need to check for both.
		// ex. (...?status=example-redirect-status-string or ...?example-redirect-status-string)
		return status === redirectUriStatusString || redirectUriStatusString in queryObject;
	};

	renderErrorNotice = () => {
		if ( ! this.state.error ) {
			return;
		}

		const { translate } = this.props;

		this.props.recordConfigureYourDomainError( this.props.selectedDomainName );

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
		const selectedDomain = getSelectedDomain( this.props );
		if (
			( ! selectedDomain.pointsToWpcom && ! this.isDomainConnectComplete() ) ||
			this.state.error
		) {
			return;
		}

		const { translate } = this.props;

		let message;
		if ( selectedDomain.pointsToWpcom ) {
			message = translate( 'Success! Your domain is configured to work with WordPress.com.' );
		} else {
			message = translate(
				'Success! Your domain is configured to work with WordPress.com. ' +
					'Please note that there may be a delay before the new settings ' +
					'take effect at your domain provider.'
			);
		}

		this.props.recordConfigureYourDomainSuccess( this.props.selectedDomainName );

		return (
			<Notice status="is-success" icon="checkmark" showDismiss={ false }>
				{ message }
			</Notice>
		);
	};

	renderActionCard = () => {
		const { translate } = this.props;
		const selectedDomain = getSelectedDomain( this.props );

		if ( selectedDomain.pointsToWpcom ) {
			return;
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Connect Your Domain' ) } />
				<Card>
					<div>
						<p>
							{ translate(
								'Your domain provider supports automatically configuring your ' +
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
				{ this.renderActionCard() }
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
		const { selectedDomainName } = this.props;
		this.setState( { submitting: true } );

		this.props.recordConfigureYourDomainClick( selectedDomainName );

		const redirectUri =
			'https://wordpress.com' +
			domainManagementDomainConnectMapping( this.props.selectedSite.slug, selectedDomainName ) +
			'?' +
			this.getRedirectUriStatusString();

		wp.req
			.get(
				`/domains/${ selectedDomainName }/dns/providers/WordPress.com/services/hosting/syncurl`,
				{ redirect_uri: redirectUri }
			)
			.then(
				( data ) => {
					const success = data?.success;
					const syncUxUrl = data?.sync_ux_apply_url;

					if ( success && syncUxUrl ) {
						this.props.recordConfigureYourDomainRedirect( selectedDomainName, syncUxUrl );
						navigate( syncUxUrl );
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
		page(
			domainManagementEdit(
				this.props.selectedSite.slug,
				this.props.selectedDomainName,
				this.props.currentRoute
			)
		);
	};
}

const recordConfigureYourDomainClick = ( domain_name ) =>
	recordTracksEvent( 'calypso_domain_connect_configure_your_domain_click', {
		domain_name,
	} );

const recordConfigureYourDomainRedirect = ( domain_name, sync_ux_url ) =>
	recordTracksEvent( 'calypso_domain_connect_configure_your_domain_recirect', {
		domain_name,
		sync_ux_url,
	} );

const recordConfigureYourDomainSuccess = ( domain_name ) =>
	recordTracksEvent( 'calypso_domain_connect_configure_your_domain_success', {
		domain_name,
	} );

const recordConfigureYourDomainError = ( domain_name ) =>
	recordTracksEvent( 'calypso_domain_connect_configure_your_domain_error', {
		domain_name,
	} );

export default connect(
	( state ) => ( {
		currentRoute: getCurrentRoute( state ),
	} ),
	{
		recordConfigureYourDomainClick,
		recordConfigureYourDomainRedirect,
		recordConfigureYourDomainSuccess,
		recordConfigureYourDomainError,
	}
)( localize( DomainConnectMapping ) );
