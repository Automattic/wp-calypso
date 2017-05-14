/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import {
	get,
	omit,
} from 'lodash';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import SiteSelector from 'components/site-selector';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSites } from 'state/selectors';
import { getSiteBySlug } from 'state/sites/selectors';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import { getSelectedDomain } from 'lib/domains';
import NonOwnerCard from 'my-sites/upgrades/domain-management/components/domain/non-owner-card';
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import SectionHeader from 'components/section-header';
import Dialog from 'components/dialog';
import { successNotice, errorNotice } from 'state/notices/actions';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

class TransferToOtherSite extends React.Component {

	static propTypes = {
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		currentUser: React.PropTypes.object.isRequired
	};

	constructor( props ) {
		super( props );

		this.state = {
			targetSite: null,
			showConfirmationDialog: false,
			disableDialogButtons: false
		};
	}

	isDataReady() {
		return this.props.domains.hasLoadedFromServer;
	}

	checkSiteEligibility = ( site ) => {
		return site.capabilities.manage_options &&
			! site.jetpack &&
			! get( site, 'options.is_domain_only', false ) &&
			site.ID !== this.props.selectedSite.ID;
	}

	handleSiteSelect = ( siteSlug ) => {
		const targetSite = this.props.siteBySlug( siteSlug );

		if ( targetSite ) {
			this.setState( {
				targetSite,
				showConfirmationDialog: true,
			} );
		}
	}

	handleConfirmTransferDomain = ( closeDialog ) => {
		const { selectedDomainName } = this.props,
			targetSiteName = this.state.targetSite.name,
			successMessage = this.props.translate(
				'%(selectedDomainName)s has been transferred to site: %(targetSiteName)s',
				{ args: { selectedDomainName, targetSiteName } } ),
			defaultErrorMessage = this.props.translate(
				'Failed to transfer %(selectedDomainName)s, please try again or contact support.', {
					args: { selectedDomainName } } );
		this.setState( { disableDialogButtons: true } );
		wpcom.transferToSite( this.props.selectedSite.ID, this.props.selectedDomainName, this.state.targetSite.ID )
			.then( () => {
				this.setState( { disableDialogButtons: false } );
				this.props.successNotice( successMessage, { duration: 10000, isPersistent: true } );
				closeDialog();
				page( paths.domainManagementList( this.props.selectedSite.slug ) );
			}, error => {
				this.setState( { disableDialogButtons: false } );
				this.props.errorNotice( error.message || defaultErrorMessage );
				closeDialog();
			} );
	}

	handleDialogClose = () => {
		if ( ! this.state.disableDialogButtons ) {
			this.setState( { showConfirmationDialog: false } );
		}
	}

	render() {
		if ( ! this.isDataReady() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		const { selectedSite, selectedDomainName } = this.props,
			{ slug } = selectedSite;

		return (
			<Main className="transfer-to-other-site">
				<Header
					selectedDomainName={ selectedDomainName }
					backHref={ paths.domainManagementTransfer( slug, selectedDomainName ) }>
					{ this.props.translate( 'Transfer Domain To Another Site' ) }
				</Header>
				{ this.renderSection() }
			</Main>
		);
	}

	renderDialog() {
		const { selectedDomainName: domainName, translate } = this.props,
			buttons = [
				{
					action: 'cancel',
					label: translate( 'Cancel' ),
					disabled: this.state.disableDialogButtons
				},
				{
					action: 'confirm',
					label: translate( 'Confirm Transfer' ),
					onClick: this.handleConfirmTransferDomain,
					disabled: this.state.disableDialogButtons,
					isPrimary: true
				}
			],
			targetSiteName = get( this.state.targetSite, 'name', '' );

		return (
			<Dialog isVisible={ this.state.showConfirmationDialog } buttons={ buttons } onClose={ this.handleDialogClose }>
				<h1>{ translate( 'Confirm Transfer' ) }</h1>
				<p>{ translate( 'Do you want to transfer {{strong}}%(domainName)s{{/strong}} ' +
					'to site {{strong}}%(targetSiteName)s{{/strong}}?', {
						args: { domainName, targetSiteName }, components: { strong: <strong /> }
					} ) }</p>
			</Dialog>
		);
	}

	renderSection() {
		const { selectedDomainName: domainName, translate } = this.props,
			{ currentUserCanManage } = getSelectedDomain( this.props );

		if ( ! currentUserCanManage ) {
			return <NonOwnerCard { ...omit( this.props, [ 'children' ] ) } />;
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Transfer Domain To Another Site' ) } />
				<Card className="transfer-to-other-site__card">
					<p>
						{ translate( 'Please choose a site you\'re an administrator on to transfer {{strong}}%(domainName)s{{/strong}} to:',
							{ args: { domainName }, components: { strong: <strong /> } } ) }
					</p>
					<SiteSelector
						filter={ this.checkSiteEligibility }
						sites={ this.props.sites }
						onSiteSelect={ this.handleSiteSelect }
					/>
				</Card>
				{ this.renderDialog() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		currentUser: getCurrentUser( state ),
		sites: getSites( state ),
		siteBySlug: ( siteSlug ) => getSiteBySlug( state, siteSlug ),
	} ),
	{
		successNotice,
		errorNotice
	}
)( localize( TransferToOtherSite ) );
