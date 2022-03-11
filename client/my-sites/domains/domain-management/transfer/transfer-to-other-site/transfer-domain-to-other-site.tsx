import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import SiteSelector from 'calypso/components/site-selector';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import wpcom from 'calypso/lib/wp';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import AftermarketAutcionNotice from 'calypso/my-sites/domains/domain-management/components/domain/aftermarket-auction-notice';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import NonTransferrableDomainNotice from 'calypso/my-sites/domains/domain-management/components/domain/non-transferrable-domain-notice';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementTransfer,
} from 'calypso/my-sites/domains/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getSites from 'calypso/state/selectors/get-sites';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { requestSites } from 'calypso/state/sites/actions';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import TransferConfirmationDialog from './confirmation-dialog';
import type {
	TransferDomainToOtherSitePassedProps,
	TransferDomainToOtherSiteProps,
	TransferDomainToOtherSiteStateProps,
} from './types';
import type { TranslateResult } from 'i18n-calypso';
import './style.scss';

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
		const isAtomic = site?.options?.is_automated_transfer ?? false;

		return (
			site.capabilities.manage_options &&
			! ( site.jetpack && ! isAtomic ) && // Simple and Atomic sites. Not Jetpack sites.
			! ( site?.options?.is_domain_only ?? false ) &&
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
		const { selectedDomainName, selectedSite } = this.props;
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
		wpcom.req
			.post(
				`/sites/${ selectedSite.ID }/domains/${ selectedDomainName }/transfer-to-site/${ targetSite.ID }`
			)
			.then(
				() => {
					this.props.successNotice( successMessage, { duration: 10000, isPersistent: true } );
					if ( this.props.isDomainOnly ) {
						this.props.requestSites();
						const transferedTo = this.props.sites.find( ( site ) => site.ID === targetSite.ID );
						page( domainManagementList( transferedTo?.slug ?? '' ) );
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

	getMessage(): TranslateResult {
		const { selectedDomainName: domainName, translate } = this.props;
		const translateArgs = { args: { domainName }, components: { strong: <strong /> } };
		return translate(
			"Transfer {{strong}}%(domainName)s{{/strong}} to a site you're an administrator of:",
			translateArgs
		);
	}

	render(): JSX.Element {
		const { selectedSite, selectedDomainName, currentRoute, translate } = this.props;
		const { slug } = selectedSite;
		const componentClassName = 'transfer-domain-to-other-site';
		if ( ! this.isDataReady() ) {
			return (
				<DomainMainPlaceholder
					breadcrumbs={ this.renderBreadcrumbs }
					backHref={ domainManagementTransfer( slug, selectedDomainName, currentRoute ) }
				/>
			);
		}

		return (
			<Main wideLayout className={ componentClassName }>
				<BodySectionCssClass
					bodyClass={ [ componentClassName ] }
					group={ componentClassName }
					section={ componentClassName }
				/>
				{ this.renderBreadcrumbs() }
				<FormattedHeader
					hasScreenOptions={ false }
					brandFont
					headerText={ translate( 'Transfer to another WordPress.com site' ) }
					align="left"
				/>
				<div className={ `${ componentClassName }__container` }>
					<div className={ `${ componentClassName }__main` }>{ this.renderSection() }</div>
				</div>
			</Main>
		);
	}

	renderBreadcrumbs = (): JSX.Element => {
		const { translate, selectedSite, selectedDomainName, currentRoute } = this.props;

		const items = [
			{
				label: translate( 'Domains' ),
				href: domainManagementList( selectedSite.slug, selectedDomainName ),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'Transfer' ),
				href: domainManagementTransfer( selectedSite.slug, selectedDomainName, currentRoute ),
			},
			{ label: translate( 'To another WordPress.com site' ) },
		];

		const mobileItem = {
			label: translate( 'Back to Transfer' ),
			href: domainManagementTransfer( selectedSite.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	renderSection(): JSX.Element {
		const { currentUserCanManage, selectedDomainName, aftermarketAuction, domain } = this.props;
		const { children, ...propsWithoutChildren } = this.props;
		if ( ! currentUserCanManage ) {
			return <NonOwnerCard { ...propsWithoutChildren } />;
		}

		if ( aftermarketAuction ) {
			return <AftermarketAutcionNotice domainName={ selectedDomainName } />;
		}

		if ( domain.expired && ! domain.isRenewable ) {
			return <NonTransferrableDomainNotice domainName={ selectedDomainName } />;
		}

		return (
			<div>
				<Card className="transfer-domain-to-other-site__card">
					<p>{ this.getMessage() }</p>
					<SiteSelector
						className={ 'transfer-domain-to-other-site__site-selector' }
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
			currentUserCanManage: typeof domain === 'object' && domain.currentUserCanManage,
			domain,
			aftermarketAuction: typeof domain === 'object' && domain.aftermarketAuction,
			hasSiteDomainsLoaded: hasLoadedSiteDomains( state, siteId ),
			isDomainOnly: isDomainOnlySite( state, siteId ),
			isMapping: Boolean( domain ) && isMappedDomain( domain ),
			sites: getSites( state ) as TransferDomainToOtherSiteStateProps[ 'sites' ],
		};
	},
	{
		errorNotice,
		requestSites,
		successNotice,
	}
)( localize( TransferDomainToOtherSite ) );
