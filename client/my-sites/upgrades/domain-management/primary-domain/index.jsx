/** External Dependencies **/
import React from 'react';
import page from 'page';

/** Internal Dependencies **/
import analyticsMixin from 'lib/mixins/analytics';
import Main from 'components/main';
import Card from 'components/card/compact';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Notice from 'components/notice';
import paths from 'my-sites/upgrades/paths';
import * as upgradesActions from 'lib/upgrades/actions';
import { getSelectedDomain } from 'lib/domains';
import SectionHeader from 'components/section-header';
import support from 'lib/url/support';

const PrimaryDomain = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'primaryDomain' ) ],

	propTypes: {
		domains: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState() {
		return {
			loading: false,
			errorMessage: null
		};
	},

	getEditPath() {
		return paths.domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName );
	},

	goToEditDomainRoot() {
		page( this.getEditPath() );
	},

	handleCancelClick() {
		this.recordEvent( 'cancelClick', getSelectedDomain( this.props ) );
		page( this.getEditPath() );
	},

	handleConfirmClick() {
		if ( ! this.state.loading ) {
			const domain = getSelectedDomain( this.props );

			this.setState( {
				loading: true,
				errorMessage: null
			} );

			upgradesActions.setPrimaryDomain( this.props.selectedSite.ID, this.props.selectedDomainName, ( error, data ) => {
				this.recordEvent( 'updatePrimaryDomainClick', domain, data && data.success );

				if ( ! error && data.success ) {
					page.redirect( this.getEditPath() );
					// no need to set loading to true again, page will redirect
				} else {
					this.setState( {
						loading: false,
						errorMessage: error.message || this.translate( 'There was a problem updating your primary domain. Please try again later or contact support' )
					} );
				}
			} );
		}
	},
	errors() {
		if ( this.state.errorMessage ) {
			return <Notice status="is-error">{ this.state.errorMessage }</Notice>;
		}
	},
	render() {
		const primaryDomainSupportUrl = support.SETTING_PRIMARY_DOMAIN;

		return (
			<Main className="domain-management-primary-domain">
				<Header
					selectedDomainName={ this.props.selectedDomainName }
					onClick={ this.goToEditDomainRoot }>
					{ this.translate( 'Primary Domain' ) }
				</Header>

				{ this.errors() }

				<SectionHeader
					label={ this.translate( 'Make %(domainName)s the Primary Domain', {
						args: { domainName: this.props.selectedDomainName }
					} ) } />

				<Card className="primary-domain-card">
					<section>
						<div className="primary-domain-explanation">
							{ this.translate( 'Your primary domain is the address visitors will see in their browser when visiting your site.' ) } <a href={ primaryDomainSupportUrl } target="_blank" rel="noopener noreferrer">{ this.translate( 'Learn More' ) }</a>
						</div>
					</section>

					<Notice
						showDismiss={ false }
						className="primary-domain-notice">
						{ this.translate( 'The primary domain for this site is currently %(oldDomainName)s. If you update the primary domain, all other domains will redirect to %(newDomainName)s.', {
							args: {
								oldDomainName: this.props.selectedSite.domain,
								newDomainName: this.props.selectedDomainName
							}
						} ) }
					</Notice>

					<section className="primary-domain-actions">
						<button
							className="button is-primary"
							disabled={ this.state.loading }
							onClick={ this.handleConfirmClick }>
							{ this.translate( 'Update Primary Domain' ) }
						</button>

						<button
							className="button"
							disabled={ this.state.loading }
							onClick={ this.handleCancelClick }>
							{ this.translate( 'Cancel' ) }
						</button>
					</section>
				</Card>
			</Main>
		);
	}
} );

export default PrimaryDomain;
