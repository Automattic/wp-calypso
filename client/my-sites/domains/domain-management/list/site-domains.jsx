/* eslint-disable wpcalypso/jsx-classname-namespace */

import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { stringify } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import DomainToPlanNudge from 'calypso/blocks/domain-to-plan-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import EmptyContent from 'calypso/components/empty-content';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { resolveDomainStatus } from 'calypso/lib/domains';
import { type } from 'calypso/lib/domains/constants';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import EmptyDomainsListCard from 'calypso/my-sites/domains/domain-management/list/empty-domains-list-card';
import FreeDomainItem from 'calypso/my-sites/domains/domain-management/list/free-domain-item';
import OptionsDomainButton from 'calypso/my-sites/domains/domain-management/list/options-domain-button';
import { domainManagementList, domainManagementRoot } from 'calypso/my-sites/domains/paths';
import BannerPromoTitanVia2fa from 'calypso/my-sites/email/banners/promo-titan-via-2fa';
import GoogleSaleBanner from 'calypso/my-sites/email/google-sale-banner';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	showUpdatePrimaryDomainSuccessNotice,
	showUpdatePrimaryDomainErrorNotice,
} from 'calypso/state/domains/management/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getPurchases, isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import DomainOnly from './domain-only';
import DomainsTable from './domains-table';
import DomainsTableFilterButton from './domains-table-filter-button';
import { filterDomainsByOwner } from './helpers';
import {
	countDomainsInOrangeStatus,
	filterOutWpcomDomains,
	getDomainManagementPath,
	getSimpleSortFunctionBy,
	getReverseSimpleSortFunctionBy,
} from './utils';

import './style.scss';
import 'calypso/my-sites/domains/style.scss';

const changePrimary = ( domain, mode ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Changed Primary Domain to in List',
			'Domain Name',
			domain.name
		),
		recordTracksEvent( 'calypso_domain_management_list_change_primary_domain_click', {
			section: domain.type,
			mode,
		} )
	);

export class SiteDomains extends Component {
	static propTypes = {
		selectedSite: PropTypes.object.isRequired,
		domains: PropTypes.array.isRequired,
		isRequestingDomains: PropTypes.bool,
		context: PropTypes.object,
		renderAllSites: PropTypes.bool,
	};

	state = {
		settingPrimaryDomain: false,
		primaryDomainIndex: -1,
	};

	isLoading() {
		return this.props.isRequestingSiteDomains && this.props.domains.length === 0;
	}

	renderNewDesign() {
		const {
			currentRoute,
			domains,
			hasProductsList,
			isAtomicSite,
			isFetchingPurchases,
			selectedSite,
			context,
			translate,
			dispatch,
		} = this.props;
		const { primaryDomainIndex, settingPrimaryDomain } = this.state;
		const disabled = settingPrimaryDomain;

		const selectedFilter = context?.query?.filter;

		const nonWpcomDomains = filterDomainsByOwner(
			filterOutWpcomDomains( domains ),
			selectedFilter
		);
		const wpcomDomain = domains.find(
			( domain ) => domain.type === type.WPCOM || domain.isWpcomStagingDomain
		);

		const domainsTableColumns = [
			{
				name: 'domain',
				label: translate( 'Domain' ),
				isSortable: true,
				initialSortOrder: 1,
				supportsOrderSwitching: true,
				sortFunctions: [ getSimpleSortFunctionBy( 'domain' ) ],
			},
			{
				name: 'status',
				label: translate( 'Status' ),
				isSortable: true,
				initialSortOrder: -1,
				sortFunctions: [
					( first, second, sortOrder ) => {
						const { listStatusWeight: firstStatusWeight } = resolveDomainStatus(
							first,
							null,
							translate,
							dispatch,
							{ getMappingErrors: true }
						);
						const { listStatusWeight: secondStatusWeight } = resolveDomainStatus(
							second,
							null,
							translate,
							dispatch,
							{ getMappingErrors: true }
						);
						return ( ( firstStatusWeight ?? 0 ) - ( secondStatusWeight ?? 0 ) ) * sortOrder;
					},
					getReverseSimpleSortFunctionBy( 'domain' ),
				],
				bubble: countDomainsInOrangeStatus(
					nonWpcomDomains.map( ( domain ) =>
						resolveDomainStatus( domain, null, translate, dispatch, {
							getMappingErrors: true,
							siteSlug: selectedSite.slug,
						} )
					)
				),
			},
			{
				name: 'registered-until',
				label: translate( 'Registered until' ),
				isSortable: true,
				initialSortOrder: 1,
				supportsOrderSwitching: true,
				sortFunctions: [ getSimpleSortFunctionBy( 'expiry' ), getSimpleSortFunctionBy( 'domain' ) ],
			},
			{ name: 'auto-renew', label: translate( 'Auto-renew' ) },
			{ name: 'email', label: translate( 'Email' ) },
			{ name: 'action', label: null },
		];

		return (
			<>
				{ ! hasProductsList && <QueryProductsList /> }

				{ ! this.isLoading() && <GoogleSaleBanner domains={ domains } /> }

				{ ! this.isLoading() && (
					<BannerPromoTitanVia2fa
						domains={ domains }
						selectedSiteSlug={ selectedSite.slug }
						currentRoute={ currentRoute }
					/>
				) }

				<div className="domain-management-list__items">
					<div className="domain-management-list__filter">
						{ this.renderDomainTableFilterButton() }
					</div>
					<DomainsTable
						currentRoute={ currentRoute }
						domains={ nonWpcomDomains }
						domainsTableColumns={ domainsTableColumns }
						goToEditDomainRoot={ this.goToEditDomainRoot }
						handleUpdatePrimaryDomainOptionClick={ this.handleUpdatePrimaryDomainOptionClick }
						isLoading={ this.isLoading() }
						primaryDomainIndex={ primaryDomainIndex }
						purchases={ this.props.purchases }
						settingPrimaryDomain={ settingPrimaryDomain }
						shouldUpgradeToMakeDomainPrimary={ this.shouldUpgradeToMakeDomainPrimary }
						sites={ { [ selectedSite.ID ]: selectedSite } }
						hasLoadedPurchases={ ! isFetchingPurchases }
					/>
				</div>
				{ ! this.isLoading() && nonWpcomDomains.length === 0 && ! selectedFilter && (
					<EmptyDomainsListCard
						selectedSite={ selectedSite }
						hasDomainCredit={ this.props.hasDomainCredit }
						hasNonWpcomDomains={ false }
					/>
				) }

				{ ! this.isLoading() && nonWpcomDomains.length > 0 && ! selectedFilter && (
					<EmptyDomainsListCard
						selectedSite={ selectedSite }
						hasDomainCredit={ this.props.hasDomainCredit }
						isCompact={ true }
						hasNonWpcomDomains={ true }
					/>
				) }

				<DomainToPlanNudge />

				{ wpcomDomain && (
					<FreeDomainItem
						key="wpcom-domain-item"
						isAtomicSite={ isAtomicSite }
						currentRoute={ currentRoute }
						domain={ wpcomDomain }
						disabled={ disabled }
						isBusy={ settingPrimaryDomain }
						site={ selectedSite }
						onMakePrimary={ this.handleUpdatePrimaryDomainWpcom }
					/>
				) }
			</>
		);
	}

	renderDomainTableFilterButton() {
		const { selectedSite, domains, context, translate } = this.props;

		const selectedFilter = context?.query?.filter;
		const nonWpcomDomains = filterOutWpcomDomains( domains );

		const filterOptions = [
			{
				label: translate( 'Site domains' ),
				value: '',
				path: domainManagementList( selectedSite?.slug ),
				count: nonWpcomDomains?.length,
			},
			{
				label: translate( 'Owned by me' ),
				value: 'owned-by-me',
				path:
					domainManagementList( selectedSite?.slug ) + '?' + stringify( { filter: 'owned-by-me' } ),
				count: filterDomainsByOwner( nonWpcomDomains, 'owned-by-me' )?.length,
			},
			{
				label: translate( 'Owned by others' ),
				value: 'owned-by-others',
				path:
					domainManagementList( selectedSite?.slug ) +
					'?' +
					stringify( { filter: 'owned-by-others' } ),
				count: filterDomainsByOwner( nonWpcomDomains, 'owned-by-others' )?.length,
			},
			null,
			{
				label: translate( 'All my domains' ),
				value: 'all-my-domains',
				path: domainManagementRoot() + '?' + stringify( { filter: 'owned-by-me' } ),
				count: null,
			},
		];

		return (
			<DomainsTableFilterButton
				key="breadcrumb_button_2"
				selectedFilter={ selectedFilter || '' }
				filterOptions={ filterOptions }
				isLoading={ this.isLoading() }
				disabled={ this.isLoading() }
			/>
		);
	}

	renderBreadcrumbs() {
		const { translate } = this.props;

		const item = {
			label: translate( 'Domains' ),
			helpBubble: translate(
				'Manage the domains connected to your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
					},
				}
			),
		};

		const buttons = [
			this.renderDomainTableFilterButton( false ),
			<OptionsDomainButton key="breadcrumb_button_1" specificSiteActions />,
			<OptionsDomainButton key="breadcrumb_button_3" ellipsisButton borderless />,
		];

		const mobileButtons = [
			<OptionsDomainButton key="breadcrumb_button_1" specificSiteActions />,
			<OptionsDomainButton key="breadcrumb_button_3" ellipsisButton borderless />,
		];

		return (
			<DomainHeader
				items={ [ item ] }
				mobileItem={ item }
				buttons={ buttons }
				mobileButtons={ mobileButtons }
			/>
		);
	}

	render() {
		if ( ! this.props.userCanManageOptions ) {
			if ( this.props.renderAllSites ) {
				return null;
			}
			return (
				<Main>
					<EmptyContent
						title={ this.props.translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}

		if ( ! this.props.domains ) {
			return null;
		}

		if ( this.props.selectedSite.jetpack && this.props.renderAllSites ) {
			return null;
		}

		if ( this.props.isDomainOnly ) {
			if ( ! this.props.renderAllSites ) {
				return (
					<Main>
						<DocumentHead title={ this.props.translate( 'Settings' ) } />
						<DomainOnly
							hasNotice={ this.isFreshDomainOnlyRegistration() }
							siteId={ this.props.selectedSite.ID }
						/>
					</Main>
				);
			}

			if ( filterOutWpcomDomains( this.props.domains ).length === 0 ) {
				return null;
			}
		}

		const headerText = this.props.translate( 'Domains', { context: 'A navigation label.' } );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Main wideLayout>
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				{ this.renderBreadcrumbs() }
				<DocumentHead title={ headerText } />
				{ this.renderNewDesign() }
			</Main>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	isFreshDomainOnlyRegistration() {
		const domainName = this.props.selectedSite.domain;
		const domain =
			! this.isLoading() && this.props.domains.find( ( { name } ) => name === domainName );

		return (
			domain &&
			domain.registrationDate &&
			this.props
				.moment()
				.subtract( 30, 'minutes' )
				.isBefore( this.props.moment( domain.registrationDate ) )
		);
	}

	async setPrimaryDomain( domainName ) {
		await this.props.dispatch( setPrimaryDomain( this.props.selectedSite.ID, domainName ) );
		page.redirect( domainManagementList( this.props.selectedSite.slug ) );
	}

	handleUpdatePrimaryDomainWpcom = ( domainName ) => {
		if ( this.state.settingPrimaryDomain ) {
			return;
		}

		this.props.dispatch( changePrimary( domainName, 'wpcom_domain_manage_click' ) );

		const currentPrimaryIndex = this.props.domains.findIndex( ( { isPrimary } ) => isPrimary );
		this.setState( { settingPrimaryDomain: true, primaryDomainIndex: -1 } );

		return this.setPrimaryDomain( domainName )
			.then(
				() => {
					this.setState( { primaryDomainIndex: -1 } );
					this.props.dispatch( showUpdatePrimaryDomainSuccessNotice( domainName ) );
				},
				( error ) => {
					this.props.dispatch( showUpdatePrimaryDomainErrorNotice( error.message ) );
					this.setState( { primaryDomainIndex: currentPrimaryIndex } );
				}
			)
			.finally( () => this.setState( { settingPrimaryDomain: false } ) );
	};

	handleUpdatePrimaryDomainOptionClick = ( index, domain ) => {
		return this.handleUpdatePrimaryDomain( index, domain, 'item_option_click' );
	};

	handleUpdatePrimaryDomain = ( index, domain, mode = 'item_select_legacy' ) => {
		if ( this.state.settingPrimaryDomain ) {
			return;
		}

		this.props.dispatch( changePrimary( domain, mode ) );
		const currentPrimaryIndex = this.props.domains.findIndex( ( { isPrimary } ) => isPrimary );
		const currentPrimaryName = this.props.domains[ currentPrimaryIndex ].name;

		if ( domain.name === currentPrimaryName ) {
			// user clicked the current primary domain
			return;
		}

		this.setState( {
			primaryDomainIndex: index,
			settingPrimaryDomain: true,
		} );

		return this.setPrimaryDomain( domain.name ).then(
			() => {
				this.setState( {
					settingPrimaryDomain: false,
				} );

				this.props.dispatch( showUpdatePrimaryDomainSuccessNotice( domain.name ) );
			},
			( error ) => {
				this.setState( {
					settingPrimaryDomain: false,
					primaryDomainIndex: currentPrimaryIndex,
				} );
				this.props.dispatch( showUpdatePrimaryDomainErrorNotice( error.message ) );
			}
		);
	};

	// TODO: maybe move this to utils?
	shouldUpgradeToMakeDomainPrimary = ( domain ) => {
		const { isDomainOnly, isOnFreePlan, hasNonPrimaryDomainsFlag, canSetPrimaryDomain } =
			this.props;

		return (
			hasNonPrimaryDomainsFlag &&
			isOnFreePlan &&
			( domain.type === type.REGISTERED || domain.type === type.MAPPED ) &&
			! isDomainOnly &&
			! domain.isPrimary &&
			! domain.isWPCOMDomain &&
			! domain.isWpcomStagingDomain &&
			! canSetPrimaryDomain
		);
	};

	goToEditDomainRoot = ( domain ) => {
		const { selectedSite, currentRoute } = this.props;
		page( getDomainManagementPath( domain.name, domain.type, selectedSite.slug, currentRoute ) );
	};
}

export default connect( ( state, ownProps ) => {
	const siteId = ownProps?.selectedSite?.ID || null;
	const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const selectedSite = ownProps?.selectedSite || null;
	const isOnFreePlan = selectedSite?.plan?.is_free || false;
	const purchases = getPurchases( state );
	const productsList = getProductsList( state );

	return {
		currentRoute: getCurrentRoute( state ),
		hasDomainCredit: !! ownProps.selectedSite && hasDomainCredit( state, siteId ),
		hasProductsList: 0 < ( Object.getOwnPropertyNames( productsList )?.length ?? 0 ),
		isDomainOnly: isDomainOnlySite( state, siteId ),
		isAtomicSite: isSiteAutomatedTransfer( state, siteId ),
		hasNonPrimaryDomainsFlag: getCurrentUser( state )
			? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
		isOnFreePlan,
		userCanManageOptions,
		canSetPrimaryDomain: siteHasFeature( state, siteId, FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ),
		purchases,
		isFetchingPurchases: isFetchingSitePurchases( state ),
	};
} )( localize( withLocalizedMoment( SiteDomains ) ) );
