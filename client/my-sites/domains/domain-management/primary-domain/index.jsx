/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import Card from 'components/card/compact';
import Header from 'my-sites/domains/domain-management/components/header';
import Notice from 'components/notice';
import { domainManagementEdit } from 'my-sites/domains/paths';
import { setPrimaryDomain } from 'lib/upgrades/actions';
import { getSelectedDomain } from 'lib/domains';
import SectionHeader from 'components/section-header';
import { SETTING_PRIMARY_DOMAIN } from 'lib/url/support';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

class PrimaryDomain extends React.Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	state = {
		loading: false,
		errorMessage: null,
	};

	getEditPath() {
		return domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName );
	}

	goToEditDomainRoot = () => {
		page( this.getEditPath() );
	};

	handleCancelClick = () => {
		this.props.cancelClick( getSelectedDomain( this.props ) );

		page( this.getEditPath() );
	};

	handleConfirmClick = () => {
		if ( ! this.state.loading ) {
			const domain = getSelectedDomain( this.props );

			this.setState( {
				loading: true,
				errorMessage: null,
			} );

			this.props.setPrimaryDomain(
				this.props.selectedSite.ID,
				this.props.selectedDomainName,
				( error, data ) => {
					this.props.updatePrimaryDomainClick( domain, data && data.success );

					if ( ! error && data.success ) {
						page.redirect( this.getEditPath() );
						// no need to set loading to true again, page will redirect
					} else {
						this.setState( {
							loading: false,
							errorMessage:
								error.message ||
								this.props.translate(
									'There was a problem updating your primary ' +
										'domain. Please try again later or contact ' +
										'support'
								),
						} );
					}
				}
			);
		}
	};

	errors() {
		if ( this.state.errorMessage ) {
			return <Notice status="is-error">{ this.state.errorMessage }</Notice>;
		}
	}

	render() {
		const { selectedDomainName, selectedSite, translate } = this.props;
		const primaryDomainSupportUrl = SETTING_PRIMARY_DOMAIN;

		return (
			<Main className="domain-management-primary-domain">
				<Header selectedDomainName={ selectedDomainName } onClick={ this.goToEditDomainRoot }>
					{ translate( 'Primary Domain' ) }
				</Header>

				{ this.errors() }

				<SectionHeader
					label={ translate( 'Make %(domainName)s the Primary Domain', {
						args: { domainName: selectedDomainName },
					} ) }
				/>

				<Card className="primary-domain-card">
					<section>
						<div className="primary-domain-explanation">
							{ translate(
								'Your primary domain is the address ' +
									'visitors will see in their browser ' +
									'when visiting your site.'
							) }
							<a href={ primaryDomainSupportUrl } target="_blank" rel="noopener noreferrer">
								{ translate( 'Learn More' ) }
							</a>
						</div>
					</section>

					<Notice showDismiss={ false } className="primary-domain-notice">
						{ translate(
							'The primary domain for this site is currently ' +
								'%(oldDomainName)s. If you update the primary ' +
								'domain, all other domains will redirect to ' +
								'%(newDomainName)s.',
							{
								args: {
									oldDomainName: selectedSite.domain,
									newDomainName: selectedDomainName,
								},
							}
						) }
					</Notice>

					<section className="primary-domain__actions">
						<button
							className="button is-primary"
							disabled={ this.state.loading }
							onClick={ this.handleConfirmClick }
						>
							{ translate( 'Update Primary Domain' ) }
						</button>

						<button
							className="button"
							disabled={ this.state.loading }
							onClick={ this.handleCancelClick }
						>
							{ translate( 'Cancel' ) }
						</button>
					</section>
				</Card>
			</Main>
		);
	}
}

const cancelClick = ( { name, type } ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Clicked "Cancel" Button on a ${ type } in Primary Domain`,
			'Domain Name',
			name
		),
		recordTracksEvent( 'calypso_domain_management_primary_domain_cancel_click', { section: type } )
	);

const updatePrimaryDomainClick = ( { name, type }, success ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Clicked "Update Primary Domain" Button on a ${ type } in Primary Domain`,
			'Domain Name',
			name
		),
		recordTracksEvent( 'calypso_domain_management_primary_domain_update_primary_domain_click', {
			section: type,
			success,
		} )
	);

export default connect( null, {
	setPrimaryDomain,
	cancelClick,
	updatePrimaryDomainClick,
} )( localize( PrimaryDomain ) );
