import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import SiteSelector from 'calypso/components/site-selector';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import wpcom from 'calypso/lib/wp';
import AftermarketAutcionNotice from 'calypso/my-sites/domains/domain-management/components/domain/aftermarket-auction-notice';
import HundredYearDomainNotTransferrableNotice from 'calypso/my-sites/domains/domain-management/components/domain/hundred-year-domain-not-transferrable-notice';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import NonTransferrableDomainNotice from 'calypso/my-sites/domains/domain-management/components/domain/non-transferrable-domain-notice';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementTransfer,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getSites from 'calypso/state/selectors/get-sites';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { requestSites } from 'calypso/state/sites/actions';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import TransferUnavailableNotice from '../transfer-unavailable-notice';
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
		const isWpcomStagingSite = site?.is_wpcom_staging_site ?? false;

		return (
			site?.capabilities?.manage_options &&
			! ( site.jetpack && ! isAtomic ) && // Simple and Atomic sites. Not Jetpack sites.
			! isWpcomStagingSite &&
			! ( site?.options?.is_domain_only ?? false ) &&
			site.ID !== this.props.selectedSite?.ID
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
		const { selectedDomainName, selectedSite, currentRoute } = this.props;
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
				`/sites/${ selectedSite?.ID }/domains/${ selectedDomainName }/transfer-to-site/${ targetSite.ID }`
			)
			.then(
				() => {
					this.props.successNotice( successMessage, { duration: 10000, isPersistent: true } );
					if ( this.props.isDomainOnly ) {
						this.props.requestSites();
						const transferedTo = this.props.sites.find( ( site ) => site.ID === targetSite.ID );
						page( domainManagementList( transferedTo?.slug ?? '', currentRoute ) );
					} else {
						page( domainManagementList( this.props.selectedSite?.slug, currentRoute ) );
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
			"Attach {{strong}}%(domainName)s{{/strong}} to a site you're an administrator of:",
			translateArgs
		);
	}

	render() {
		const { selectedSite, selectedDomainName, currentRoute, showHeader } = this.props;
		const slug = selectedSite?.slug;
		const componentClassName = 'transfer-domain-to-other-site';

		if ( ! this.isDataReady() ) {
			return (
				<DomainMainPlaceholder
					breadcrumbs={ showHeader && this.renderHeader }
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
				{ showHeader && this.renderHeader() }
				<div className={ `${ componentClassName }__container` }>
					<div className={ `${ componentClassName }__main` }>{ this.renderSection() }</div>
				</div>
			</Main>
		);
	}

	renderHeader = () => {
		const { translate, selectedSite, selectedDomainName, currentRoute } = this.props;

		const items = [
			{
				label: isUnderDomainManagementAll( currentRoute )
					? translate( 'All Domains' )
					: translate( 'Domains' ),
				href: domainManagementList(
					selectedSite?.slug,
					selectedDomainName,
					selectedSite?.options?.is_domain_only
				),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite?.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'Attach' ),
				href: domainManagementTransfer( selectedSite?.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'To another WordPress.com site' ),
			},
		];

		const mobileItem = {
			label: translate( 'Back to Transfer' ),
			href: domainManagementTransfer( selectedSite?.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		return (
			<DomainHeader
				items={ items }
				mobileItem={ mobileItem }
				titleOverride={
					<FormattedHeader
						hasScreenOptions={ false }
						headerText={ translate( 'Connect to another WordPress.com site' ) }
						align="left"
					/>
				}
			/>
		);
	};

	renderSection() {
		const { currentUserCanManage, selectedDomainName, aftermarketAuction, translate, domain } =
			this.props;
		const { children, ...propsWithoutChildren } = this.props;
		if ( ! currentUserCanManage ) {
			return <NonOwnerCard { ...propsWithoutChildren } />;
		}

		if ( domain?.isHundredYearDomain ) {
			return <HundredYearDomainNotTransferrableNotice />;
		}

		if ( aftermarketAuction ) {
			return <AftermarketAutcionNotice domainName={ selectedDomainName } />;
		}

		if ( domain && domain.isRedeemable ) {
			return <NonTransferrableDomainNotice domainName={ selectedDomainName } />;
		}

		if ( domain?.pendingRegistration || domain?.pendingRegistrationAtRegistry ) {
			return (
				<TransferUnavailableNotice
					message={ translate(
						'We are still setting up your domain. You will not be able to transfer it until the registration setup is done.'
					) }
				></TransferUnavailableNotice>
			);
		}

		return (
			<div>
				<Card className="transfer-domain-to-other-site__card">
					<p>{ this.getMessage() }</p>
					<SiteSelector
						className="transfer-domain-to-other-site__site-selector"
						filter={ this.isSiteEligible }
						sites={ this.props.sites }
						onSiteSelect={ this.handleSiteSelect }
					/>
				</Card>
				{ this.state.targetSiteId && (
					<TransferConfirmationDialog
						disableDialogButtons={ this.state.disableDialogButtons }
						domain={ domain }
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
	( state: IAppState, ownProps: TransferDomainToOtherSitePassedProps ) => {
		let domain;
		if ( ! ownProps.isRequestingSiteDomains ) {
			domain = getSelectedDomain( ownProps );
		}
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
			showHeader: ownProps?.context?.params?.showPageHeader ?? true,
		};
	},
	{
		errorNotice,
		requestSites,
		successNotice,
	}
)( localize( TransferDomainToOtherSite ) );
