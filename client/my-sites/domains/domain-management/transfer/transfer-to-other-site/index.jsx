/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, get, omit } from 'lodash';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'client/components/card';
import SiteSelector from 'client/components/site-selector';
import { getCurrentUser, currentUserHasFlag } from 'client/state/current-user/selectors';
import { DOMAINS_WITH_PLANS_ONLY } from 'client/state/current-user/constants';
import { getSites } from 'client/state/selectors';
import Header from 'client/my-sites/domains/domain-management/components/header';
import Main from 'client/components/main';
import paths from 'client/my-sites/domains/paths';
import { getSelectedDomain } from 'client/lib/domains';
import { isDomainOnlySite } from 'client/state/selectors';
import NonOwnerCard from 'client/my-sites/domains/domain-management/components/domain/non-owner-card';
import DomainMainPlaceholder from 'client/my-sites/domains/domain-management/components/domain/main-placeholder';
import SectionHeader from 'client/components/section-header';
import TransferConfirmationDialog from './confirmation-dialog';
import { successNotice, errorNotice } from 'client/state/notices/actions';
import wp from 'client/lib/wp';
import { PLAN_FREE } from 'client/lib/plans/constants';
import { requestSites } from 'client/state/sites/actions';

const wpcom = wp.undocumented();

class TransferToOtherSite extends React.Component {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.object.isRequired,
		currentUser: PropTypes.object.isRequired,
		isDomainOnly: PropTypes.bool.isRequired,
	};

	state = {
		targetSiteId: null,
		showConfirmationDialog: false,
		disableDialogButtons: false,
	};

	isDataReady() {
		return this.props.domains.hasLoadedFromServer;
	}

	isSiteEligible = site => {
		return (
			site.capabilities.manage_options &&
			! site.jetpack &&
			! get( site, 'options.is_domain_only', false ) &&
			! ( this.props.domainsWithPlansOnly && get( site, 'plan.product_slug' ) === PLAN_FREE ) &&
			site.ID !== this.props.selectedSite.ID
		);
	};

	handleSiteSelect = targetSiteId => {
		this.setState( {
			targetSiteId,
			showConfirmationDialog: true,
		} );
	};

	handleConfirmTransfer = ( targetSite, closeDialog ) => {
		const { selectedDomainName } = this.props;
		const targetSiteName = targetSite.name;
		const successMessage = this.props.translate(
			'%(selectedDomainName)s has been transferred to site: %(targetSiteName)s',
			{ args: { selectedDomainName, targetSiteName } }
		);
		const defaultErrorMessage = this.props.translate(
			'Failed to transfer %(selectedDomainName)s, please try again or contact support.',
			{
				args: { selectedDomainName },
			}
		);

		this.setState( { disableDialogButtons: true } );
		wpcom
			.transferToSite( this.props.selectedSite.ID, this.props.selectedDomainName, targetSite.ID )
			.then(
				() => {
					this.props.successNotice( successMessage, { duration: 10000, isPersistent: true } );
					if ( this.props.isDomainOnly ) {
						this.props.requestSites();
						const transferedTo = find( this.props.sites, { ID: targetSite.ID } );
						page( paths.domainManagementList( transferedTo.slug ) );
					} else {
						page( paths.domainManagementList( this.props.selectedSite.slug ) );
					}
				},
				error => {
					this.setState( { disableDialogButtons: false } );
					closeDialog();
					this.props.errorNotice( error.message || defaultErrorMessage );
				}
			);
	};

	handleDialogClose = () => {
		if ( ! this.state.disableDialogButtons ) {
			this.setState( { showConfirmationDialog: false } );
		}
	};

	render() {
		if ( ! this.isDataReady() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		const { selectedSite, selectedDomainName } = this.props;
		const { slug } = selectedSite;

		return (
			<Main className="transfer-to-other-site">
				<Header
					selectedDomainName={ selectedDomainName }
					backHref={ paths.domainManagementTransfer( slug, selectedDomainName ) }
				>
					{ this.props.translate( 'Transfer Domain To Another Site' ) }
				</Header>
				{ this.renderSection() }
			</Main>
		);
	}

	renderSection() {
		const { currentUserCanManage } = getSelectedDomain( this.props );
		if ( ! currentUserCanManage ) {
			return <NonOwnerCard { ...omit( this.props, [ 'children' ] ) } />;
		}

		const { selectedDomainName: domainName, domainsWithPlansOnly, translate } = this.props;
		let message;
		if ( domainsWithPlansOnly ) {
			message = translate(
				'Please choose a site with a paid plan ' +
					"you're an administrator on to transfer {{strong}}%(domainName)s{{/strong}} to:",
				{ args: { domainName }, components: { strong: <strong /> } }
			);
		} else {
			message = translate(
				"Please choose a site you're an administrator on to transfer {{strong}}%(domainName)s{{/strong}} to:",
				{ args: { domainName }, components: { strong: <strong /> } }
			);
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Transfer Domain To Another Site' ) } />
				<Card className="transfer-to-other-site__card">
					<p>{ message }</p>
					<SiteSelector
						filter={ this.isSiteEligible }
						sites={ this.props.sites }
						onSiteSelect={ this.handleSiteSelect }
					/>
				</Card>
				{ this.state.targetSiteId && (
					<TransferConfirmationDialog
						targetSiteId={ this.state.targetSiteId }
						domainName={ this.props.selectedDomainName }
						onConfirmTransfer={ this.handleConfirmTransfer }
						onClose={ this.handleDialogClose }
						isVisible={ this.state.showConfirmationDialog }
						disableDialogButtons={ this.state.disableDialogButtons }
					/>
				) }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		currentUser: getCurrentUser( state ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		isDomainOnly: isDomainOnlySite( state, ownProps.selectedSite.ID ),
		sites: getSites( state ),
	} ),
	{
		errorNotice,
		requestSites,
		successNotice,
	}
)( localize( TransferToOtherSite ) );
