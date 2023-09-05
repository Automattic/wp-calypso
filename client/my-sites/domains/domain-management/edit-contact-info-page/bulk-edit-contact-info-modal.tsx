import {
	useAllDomainsQuery,
	useDomainsBulkActionsMutation,
	type SiteDetails,
	getSiteDomainsQueryObject,
} from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQueries } from '@tanstack/react-query';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import ExternalLink from 'calypso/components/external-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain } from 'calypso/lib/domains';
import { ResponseDomain } from 'calypso/lib/domains/types';
import InfoNotice from 'calypso/my-sites/domains/domain-management/components/domain/info-notice';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import { domainManagementList, isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhoisSelector from 'calypso/state/selectors/is-requesting-whois';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { IAppState } from 'calypso/state/types';
import EditContactInfoFormCard from '../edit-contact-info/form-card';
import PendingWhoisUpdateCard from '../edit-contact-info/pending-whois-update-card';
import EditContactInfoPrivacyEnabledCard from '../edit-contact-info/privacy-enabled-card';

import './style.scss';

interface BulkEditContactInfoPageProps {
	selectedSite: SiteDetails | null;
	context: PageJS.Context;
}

export default function BulkEditContactInfoPage( {
	selectedSite,
	context,
}: BulkEditContactInfoPageProps ) {
	const translate = useTranslate();

	const selectedDomainsArg = getQueryArg( '?' + context.querystring, 'selected' );

	const { data: partialDomainsData } = useAllDomainsQuery();

	const allSiteIds =
		Array.isArray( selectedDomainsArg ) && partialDomainsData
			? [
					...new Set(
						partialDomainsData.domains
							.filter( ( { domain } ) => selectedDomainsArg.includes( domain ) )
							.map( ( { blog_id } ) => blog_id )
					),
			  ]
			: [];

	const allSiteDomains = useQueries( {
		queries: allSiteIds.map( ( siteId ) => getSiteDomainsQueryObject( siteId ) ),
	} ).flatMap( ( { data } ) => data?.domains || [] );

	const selectedDomains = Array.isArray( selectedDomainsArg )
		? allSiteDomains.filter( ( { domain } ) => selectedDomainsArg.includes( domain ) )
		: null;
	const firstSelectedDomain = selectedDomains?.[ 0 ];

	const reduxDomains: ResponseDomain[] | undefined = useSelector(
		( state: IAppState ) =>
			firstSelectedDomain && getDomainsBySiteId( state, firstSelectedDomain.blog_id )
	);

	const currentRoute = useSelector( getCurrentRoute );
	const isRequestingWhois = useSelector( ( state: IAppState ) =>
		firstSelectedDomain ? isRequestingWhoisSelector( state, firstSelectedDomain.domain ) : false
	);

	const isDataLoading = () =>
		isRequestingWhois ||
		! firstSelectedDomain ||
		! reduxDomains ||
		! getSelectedDomain( {
			domains: reduxDomains,
			selectedDomainName: firstSelectedDomain.domain,
		} );

	const domainsListPath = domainManagementList(
		selectedSite?.slug,
		currentRoute,
		selectedSite?.options?.is_domain_only
	);

	const goToDomainsList = () => {
		page( domainsListPath );
	};

	const { updateContactInfo } = useDomainsBulkActionsMutation( {
		onSuccess: goToDomainsList,
	} );

	const handleSubmitButtonClick = (
		newContactDetails: Record< string, string >,
		transferLock: boolean
		// updateWpcomEmail: boolean
	) => {
		const domainNames = selectedDomains?.map( ( domain ) => domain.domain );

		if ( domainNames ) {
			updateContactInfo( domainNames, transferLock, newContactDetails );
		}

		return 'cancel';
	};

	const renderHeader = () => {
		if ( ! selectedSite ) {
			return null;
		}

		const items = [
			{
				label: isUnderDomainManagementAll( currentRoute )
					? translate( 'All Domains' )
					: translate( 'Domains' ),
				backLink: domainsListPath,
			},
			{
				label: translate( 'Edit contact infomation' ),
				subtitle: translate( 'Domain owners are required to provide correct contact information.' ),
			},
		];

		const mobileItem = {
			label: translate( 'Back' ),
			href: domainsListPath,
			showBackArrow: true,
		};

		return <DomainHeader items={ items } mobileItem={ mobileItem } />;
	};

	const renderContent = () => {
		if ( ! firstSelectedDomain || ! reduxDomains ) {
			return <></>;
		}

		const firstDomainUserCanNotManage = selectedDomains.find(
			( domain ) => ! domain.current_user_can_manage
		);

		if ( firstDomainUserCanNotManage ) {
			return (
				<NonOwnerCard
					domains={ partialDomainsData }
					selectedDomainName={ firstDomainUserCanNotManage.domain }
				/>
			);
		}

		const firstDomainUserCanNotUpdate = selectedDomains?.find(
			( domain ) => ! domain.can_update_contact_info
		);

		if ( firstDomainUserCanNotUpdate ) {
			return (
				<InfoNotice
					redesigned={ false }
					text={ firstDomainUserCanNotUpdate.cannot_update_contact_info_reason }
				/>
			);
		}

		if ( selectedDomains?.some( ( domain ) => domain.pending_whois_update ) ) {
			return <PendingWhoisUpdateCard />;
		}

		const firstDomainNeedingPrivacyRemoved = selectedDomains?.find(
			( domain ) => domain.must_remove_privacy_before_contact_update && domain.private_domain
		);

		if ( firstDomainNeedingPrivacyRemoved && selectedSite ) {
			return (
				<EditContactInfoPrivacyEnabledCard
					selectedDomainName={ firstDomainNeedingPrivacyRemoved.domain }
					selectedSiteSlug={ selectedSite.slug }
				/>
			);
		}

		return (
			<EditContactInfoFormCard
				domainRegistrationAgreementUrl={ firstSelectedDomain.domain_registration_agreement_url }
				selectedDomain={ getSelectedDomain( {
					domains: reduxDomains,
					selectedDomainName: firstSelectedDomain.domain,
				} ) }
				selectedSite={ selectedSite }
				showContactInfoNote={ false }
				backUrl={ domainsListPath }
				onSubmitButtonClick={ handleSubmitButtonClick }
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
			<>
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
				<div className="edit-contact-info-page__sidebar" style={ { background: 'transparent' } }>
					<div className="edit-contact-info-page__sidebar-title">
						<p>
							<strong>{ translate( 'Editing contact info for:' ) }</strong>
						</p>
					</div>
					<ul>
						{ selectedDomains?.map( ( domain ) => (
							<li key={ domain.domain }>{ domain.domain }</li>
						) ) }
					</ul>
				</div>
			</>
		);
	};

	if ( isDataLoading() ) {
		return (
			<>
				{ firstSelectedDomain && <QuerySiteDomains siteId={ firstSelectedDomain.blog_id } /> }
				<DomainMainPlaceholder goBack={ goToDomainsList } />
			</>
		);
	}

	return (
		<Main className="edit-contact-info-page" wideLayout>
			{ firstSelectedDomain && <QuerySiteDomains siteId={ firstSelectedDomain.blog_id } /> }
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderHeader() }
			<TwoColumnsLayout content={ renderContent() } sidebar={ renderSidebar() } />
		</Main>
	);
}
