import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import ExternalLink from 'calypso/components/external-link';
import Main from 'calypso/components/main';
import useDomainTransferRequestQuery from 'calypso/data/domains/transfers/use-domain-transfer-request-query';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain } from 'calypso/lib/domains';
import InfoNotice from 'calypso/my-sites/domains/domain-management/components/domain/info-notice';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import {
	domainManagementEdit,
	domainManagementList,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import { IAppState } from 'calypso/state/types';
import EditContactInfoFormCard from '../edit-contact-info/form-card';
import PendingWhoisUpdateCard from '../edit-contact-info/pending-whois-update-card';
import EditContactInfoPrivacyEnabledCard from '../edit-contact-info/privacy-enabled-card';
import { EditContactInfoPageProps } from './types';

import './style.scss';

const EditContactInfoPage = ( {
	currentRoute,
	domains,
	isRequestingWhois,
	selectedDomainName,
	selectedSite,
}: EditContactInfoPageProps ) => {
	const translate = useTranslate();

	const { data } = useDomainTransferRequestQuery( selectedSite?.slug ?? '', selectedDomainName );
	const transferPending = !! data?.email;

	useEffect( () => {
		if ( transferPending ) {
			page( domainManagementEdit( selectedSite?.slug ?? '', selectedDomainName, currentRoute ) );
		}
	}, [ transferPending, selectedSite, selectedDomainName, currentRoute ] );

	const isDataLoading = () => {
		return ! getSelectedDomain( { domains, selectedDomainName } ) || isRequestingWhois;
	};

	const renderHeader = () => {
		if ( ! selectedSite ) {
			return null;
		}

		const previousPath = domainManagementEdit(
			selectedSite?.slug,
			selectedDomainName,
			currentRoute
		);

		const items = [
			{
				label: isUnderDomainManagementAll( currentRoute )
					? translate( 'All Domains' )
					: translate( 'Domains' ),
				href: domainManagementList(
					selectedSite?.slug,
					currentRoute,
					selectedSite?.options?.is_domain_only
				),
			},
			{
				label: selectedDomainName,
				href: previousPath,
			},
			{
				label: translate( 'Edit contact infomation' ),
				subtitle: translate( 'Domain owners are required to provide correct contact information.' ),
			},
		];

		const mobileItem = {
			label: translate( 'Back' ),
			href: previousPath,
			showBackArrow: true,
		};

		return <DomainHeader items={ items } mobileItem={ mobileItem } />;
	};

	const renderContent = () => {
		const domain = getSelectedDomain( { domains, selectedDomainName } );

		if ( ! domain?.currentUserCanManage ) {
			return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
		}

		if ( ! domain.canUpdateContactInfo ) {
			return <InfoNotice redesigned={ false } text={ domain.cannotUpdateContactInfoReason } />;
		}

		if ( domain.isPendingWhoisUpdate ) {
			return <PendingWhoisUpdateCard />;
		}

		if ( domain.mustRemovePrivacyBeforeContactUpdate && domain.privateDomain && selectedSite ) {
			return (
				<EditContactInfoPrivacyEnabledCard
					selectedDomainName={ selectedDomainName }
					selectedSiteSlug={ selectedSite?.slug }
				/>
			);
		}

		const backUrl = domainManagementEdit(
			selectedSite?.slug ?? '',
			selectedDomainName,
			currentRoute
		);

		return (
			<EditContactInfoFormCard
				domainRegistrationAgreementUrl={ domain.domainRegistrationAgreementUrl }
				selectedDomain={ domain }
				selectedSite={ selectedSite }
				showContactInfoNote={ false }
				backUrl={ backUrl }
			/>
		);
	};

	const renderSidebar = () => {
		const supportLink = (
			<ExternalLink
				href={ localizeUrl(
					'https://wordpress.com/support/domains/domain-registrations-and-privacy/#privacy-protection'
				) }
				target="_blank"
				icon={ false }
			/>
		);
		const icannLink = (
			<ExternalLink
				href="https://www.icann.org/resources/pages/contact-verification-2013-05-03-en"
				target="_blank"
				icon={ false }
			/>
		);

		return (
			<div className="edit-contact-info-page__sidebar">
				<div className="edit-contact-info-page__sidebar-title">
					<p>
						<strong>{ translate( 'Provide accurate contact information' ) }</strong>
					</p>
				</div>
				<div className="edit-contact-info-page__sidebar-content">
					<p>
						{ translate(
							'{{icannLinkComponent}}ICANN{{/icannLinkComponent}} requires accurate contact information for registrants. This information will be validated after purchase. Failure to validate your contact information will result in domain suspension.',
							{
								components: {
									icannLinkComponent: icannLink,
								},
							}
						) }
					</p>
					<p>
						{ translate(
							'Domain privacy service is included for free on applicable domains. {{supportLinkComponent}}Learn more{{/supportLinkComponent}}.',
							{
								components: {
									supportLinkComponent: supportLink,
								},
							}
						) }
					</p>
				</div>
			</div>
		);
	};

	if ( isDataLoading() ) {
		return <DomainMainPlaceholder />;
	}

	return (
		<Main className="edit-contact-info-page" wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderHeader() }
			<TwoColumnsLayout content={ renderContent() } sidebar={ renderSidebar() } />
		</Main>
	);
};

export default connect( ( state: IAppState, ownProps: EditContactInfoPageProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( EditContactInfoPage );
