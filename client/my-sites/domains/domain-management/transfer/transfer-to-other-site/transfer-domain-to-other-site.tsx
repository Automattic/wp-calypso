import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { find, get, omit } from 'lodash';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import SiteSelector from 'calypso/components/site-selector';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import wp from 'calypso/lib/wp';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import { domainManagementList, domainManagementTransfer } from 'calypso/my-sites/domains/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getSites from 'calypso/state/selectors/get-sites';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { requestSites } from 'calypso/state/sites/actions';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import TransferConfirmationDialog from './confirmation-dialog';
import type { TransferDomainToOtherSitePassedProps, TransferDomainToOtherSiteProps } from './types';

const wpcom = wp.undocumented();

export class TransferDomainToOtherSite extends Component< TransferDomainToOtherSiteProps > {
	state = {
		targetSiteId: null,
		showConfirmationDialog: false,
		disableDialogButtons: false,
	};

	isDataReady(): boolean {
		return ! this.props.isRequestingSiteDomains && this.props.hasSiteDomainsLoaded;
	}

	isSiteEligible = ( site: TransferDomainToOtherSiteProps[ 'selectedSite' ] ): boolean => {
		// check if it's an Atomic site from the site options
		const isAtomic = get( site, 'options.is_automated_transfer', false );

		return (
			site.capabilities.manage_options &&
			! ( site.jetpack && ! isAtomic ) && // Simple and Atomic sites. Not Jetpack sites.
			! get( site, 'options.is_domain_only', false ) &&
			site.ID !== this.props.selectedSite.ID
		);
	};

	handleSiteSelect = ( targetSiteId: number ): void => {
		this.setState( {
			targetSiteId,
			showConfirmationDialog: true,
		} );
	};

	handleConfirmTransfer = (
		targetSite: TransferDomainToOtherSiteProps[ 'selectedSite' ],
		closeDialog: () => void
	): void => {
		const { selectedDomainName } = this.props;
		const targetSiteTitle = targetSite.title;
		const successMessage = this.props.translate(
			'%(selectedDomainName)s has been transferred to site: %(targetSiteTitle)s',
			{ args: { selectedDomainName, targetSiteTitle } }
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
						page( domainManagementList( ( transferedTo! as Record< string, unknown > ).slug ) );
					} else {
						page( domainManagementList( this.props.selectedSite.slug ) );
					}
				},
				( error: Error ) => {
					this.setState( { disableDialogButtons: false } );
					closeDialog();
					this.props.errorNotice( error.message || defaultErrorMessage );
				}
			);
	};

	handleDialogClose = (): void => {
		if ( ! this.state.disableDialogButtons ) {
			this.setState( { showConfirmationDialog: false } );
		}
	};

	getMessage(): i18nCalypso.TranslateResult {
		const { selectedDomainName: domainName, isMapping, translate } = this.props;
		const translateArgs = { args: { domainName }, components: { strong: <strong /> } };

		if ( isMapping ) {
			return translate(
				"Please choose a site you're an administrator on to transfer domain mapping for {{strong}}%(domainName)s{{/strong}} to:",
				translateArgs
			);
		}

		return translate(
			"Please choose a site you're an administrator on to transfer {{strong}}%(domainName)s{{/strong}} to:",
			translateArgs
		);
	}

	render(): JSX.Element {
		const { selectedSite, selectedDomainName, currentRoute, isMapping } = this.props;
		const { slug } = selectedSite;
		if ( ! this.isDataReady() ) {
			return (
				<DomainMainPlaceholder
					backHref={ domainManagementTransfer( slug, selectedDomainName, currentRoute ) }
				/>
			);
		}

		return (
			<Main className="transfer-to-other-site">
				<Header
					selectedDomainName={ selectedDomainName }
					backHref={ domainManagementTransfer( slug, selectedDomainName, currentRoute ) }
				>
					{ isMapping
						? this.props.translate( 'Transfer Domain Mapping To Another Site' )
						: this.props.translate( 'Transfer Domain To Another Site' ) }
				</Header>
				{ this.renderSection() }
			</Main>
		);
	}

	renderSection(): JSX.Element {
		const { currentUserCanManage, selectedDomainName } = this.props;
		if ( ! currentUserCanManage ) {
			return <NonOwnerCard { ...omit( this.props, [ 'children' ] ) } />;
		}

		return (
			<div>
				<Card className="transfer-to-other-site__card">
					<p>{ this.getMessage() }</p>
					<SiteSelector
						filter={ this.isSiteEligible }
						sites={ this.props.sites }
						onSiteSelect={ this.handleSiteSelect }
					/>
				</Card>
				{ this.state.targetSiteId && (
					<TransferConfirmationDialog
						disableDialogButtons={ this.state.disableDialogButtons }
						domainName={ selectedDomainName }
						isMapping={ this.props.isMapping }
						isVisible={ this.state.showConfirmationDialog }
						onConfirmTransfer={ this.handleConfirmTransfer }
						onClose={ this.handleDialogClose }
						targetSiteId={ this.state.targetSiteId }
					/>
				) }
			</div>
		);
	}
}

export default connect(
	( state, ownProps: TransferDomainToOtherSitePassedProps ) => {
		const domain = ! ownProps.isRequestingSiteDomains && getSelectedDomain( ownProps );
		const siteId = getSelectedSiteId( state );
		return {
			currentRoute: getCurrentRoute( state ),
			currentUserCanManage: Boolean( domain ) && domain.currentUserCanManage,
			hasSiteDomainsLoaded: hasLoadedSiteDomains( state, siteId ),
			isDomainOnly: isDomainOnlySite( state, siteId ),
			isMapping: Boolean( domain ) && isMappedDomain( domain ),
			sites: getSites( state ),
		};
	},
	{
		errorNotice,
		requestSites,
		successNotice,
	}
)( localize( TransferDomainToOtherSite ) );
