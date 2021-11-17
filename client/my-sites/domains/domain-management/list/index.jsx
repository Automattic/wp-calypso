/* eslint-disable wpcalypso/jsx-classname-namespace */

import config from '@automattic/calypso-config';
import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DomainToPlanNudge from 'calypso/blocks/domain-to-plan-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import { type } from 'calypso/lib/domains/constants';
import HeaderCart from 'calypso/my-sites/checkout/cart/header-cart';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import EmptyDomainsListCard from 'calypso/my-sites/domains/domain-management/list/empty-domains-list-card';
import OptionsDomainButton from 'calypso/my-sites/domains/domain-management/list/options-domain-button';
import WpcomDomainItem from 'calypso/my-sites/domains/domain-management/list/wpcom-domain-item';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import GoogleSaleBanner from 'calypso/my-sites/email/google-sale-banner';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import getSites from 'calypso/state/selectors/get-sites';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import DomainItem from './domain-item';
import DomainOnly from './domain-only';
import ListItemPlaceholder from './item-placeholder';
import ListHeader from './list-header';
import {
	filterOutWpcomDomains,
	getDomainManagementPath,
	showUpdatePrimaryDomainSuccessNotice,
	showUpdatePrimaryDomainErrorNotice,
} from './utils';

import './style.scss';
import 'calypso/my-sites/domains/style.scss';

const noop = () => {};

export class List extends Component {
	static propTypes = {
		selectedSite: PropTypes.object.isRequired,
		domains: PropTypes.array.isRequired,
		isRequestingDomains: PropTypes.bool,
		context: PropTypes.object,
		renderAllSites: PropTypes.bool,
		hasSingleSite: PropTypes.bool,
	};

	static defaultProps = {
		changePrimary: noop,
	};

	state = {
		settingPrimaryDomain: false,
		primaryDomainIndex: -1,
	};

	isLoading() {
		return this.props.isRequestingSiteDomains && this.props.domains.length === 0;
	}

	domainWarnings() {
		if ( ! this.isLoading() ) {
			return (
				<DomainWarnings
					domains={ this.props.domains }
					position="domain-list"
					selectedSite={ this.props.selectedSite }
					allowedRules={ [
						'unverifiedDomainsCanManage',
						'pendingGSuiteTosAcceptanceDomains',
						'unverifiedDomainsCannotManage',
						'transferStatus',
						'newTransfersWrongNS',
						'pendingConsent',
					] }
				/>
			);
		}
	}

	renderNewDesign() {
		const {
			currentRoute,
			domains,
			hasProductsList,
			isAtomicSite,
			selectedSite,
			translate,
		} = this.props;
		const { settingPrimaryDomain } = this.state;
		const disabled = settingPrimaryDomain;

		const nonWpcomDomains = filterOutWpcomDomains( domains );
		const wpcomDomain = domains.find(
			( domain ) => domain.type === type.WPCOM || domain.isWpcomStagingDomain
		);

		return (
			<>
				{ ! hasProductsList && <QueryProductsList /> }

				<div className="domains__header">
					<FormattedHeader
						brandFont
						className="domain-management__page-heading"
						headerText={ translate( 'Site Domains' ) }
						subHeaderText={ translate(
							'Manage the domains connected to your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
							{
								components: {
									learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
								},
							}
						) }
						align="left"
					/>
					<div className="domains__header-buttons">
						<HeaderCart
							selectedSite={ this.props.selectedSite }
							currentRoute={ this.props.currentRoute }
						/>
						{ this.optionsDomainButton() }
					</div>
				</div>

				{ this.domainWarnings() }

				{ ! this.isLoading() && nonWpcomDomains.length === 0 && (
					<EmptyDomainsListCard
						selectedSite={ selectedSite }
						hasDomainCredit={ this.props.hasDomainCredit }
						hasNonWpcomDomains={ false }
					/>
				) }

				{ ! this.isLoading() && <GoogleSaleBanner domains={ domains } /> }

				<div className="domain-management-list__items">{ this.listNewItems() }</div>

				{ ! this.isLoading() && nonWpcomDomains.length > 0 && (
					<EmptyDomainsListCard
						selectedSite={ selectedSite }
						hasDomainCredit={ this.props.hasDomainCredit }
						isCompact={ true }
						hasNonWpcomDomains={ true }
					/>
				) }

				<DomainToPlanNudge />

				{ wpcomDomain && (
					<WpcomDomainItem
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

	render() {
		if ( ! this.props.userCanManageOptions ) {
			if ( this.props.renderAllSites ) {
				return null;
			}
			return (
				<Main>
					<SidebarNavigation />
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
						<SidebarNavigation />
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
				<DocumentHead title={ headerText } />
				<SidebarNavigation />
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

	optionsDomainButton() {
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			return null;
		}

		return <OptionsDomainButton />;
	}

	setPrimaryDomain( domainName ) {
		return new Promise( ( resolve, reject ) => {
			this.props.setPrimaryDomain( this.props.selectedSite.ID, domainName, ( error, data ) => {
				if ( ! error && data && data.success ) {
					page.redirect( domainManagementList( this.props.selectedSite.slug ) );
					resolve();
				} else {
					reject( error );
				}
			} );
		} );
	}

	handleUpdatePrimaryDomainWpcom = ( domainName ) => {
		if ( this.state.settingPrimaryDomain ) {
			return;
		}

		this.props.changePrimary( domainName, 'wpcom_domain_manage_click' );

		const currentPrimaryIndex = this.props.domains.findIndex( ( { isPrimary } ) => isPrimary );
		this.setState( { settingPrimaryDomain: true, primaryDomainIndex: -1 } );

		return this.setPrimaryDomain( domainName )
			.then(
				() => {
					this.setState( { primaryDomainIndex: -1 } );
					showUpdatePrimaryDomainSuccessNotice( domainName );
				},
				( error ) => {
					showUpdatePrimaryDomainErrorNotice( error.message );
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

		this.props.changePrimary( domain, mode );
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

				showUpdatePrimaryDomainSuccessNotice( domain.name );
			},
			( error ) => {
				this.setState( {
					settingPrimaryDomain: false,
					primaryDomainIndex: currentPrimaryIndex,
				} );
				showUpdatePrimaryDomainErrorNotice( error.message );
			}
		);
	};

	shouldUpgradeToMakeDomainPrimary( domain ) {
		const {
			isDomainOnly,
			isOnFreePlan,
			hasNonPrimaryDomainsFlag,
			canSetPrimaryDomain,
		} = this.props;

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
	}

	listNewItems() {
		if ( this.isLoading() ) {
			return [
				<ListItemPlaceholder key="item-1" />,
				<ListItemPlaceholder key="item-2" />,
				<ListItemPlaceholder key="item-3" />,
			];
		}

		const { currentRoute, selectedSite } = this.props;
		const { primaryDomainIndex, settingPrimaryDomain } = this.state;

		const domains = filterOutWpcomDomains( this.props.domains );
		const disabled = settingPrimaryDomain;

		const domainListItems = domains.map( ( domain, index ) => (
			<DomainItem
				key={ `${ domain.name }-${ index }` }
				currentRoute={ currentRoute }
				domain={ domain }
				domainDetails={ domain }
				site={ selectedSite }
				isManagingAllSites={ false }
				onClick={ settingPrimaryDomain ? noop : this.goToEditDomainRoot }
				isBusy={ settingPrimaryDomain && index === primaryDomainIndex }
				busyMessage={ this.props.translate( 'Setting Primary Domain…', {
					context: 'Shows up when the primary domain is changing and the user is waiting',
				} ) }
				disabled={ disabled }
				selectionIndex={ index }
				onMakePrimaryClick={ this.handleUpdatePrimaryDomainOptionClick }
				shouldUpgradeToMakePrimary={ this.shouldUpgradeToMakeDomainPrimary( domain ) }
			/>
		) );

		return [
			<QuerySitePurchases key="query-purchases" siteId={ selectedSite.ID } />,
			domains.length > 0 && <ListHeader key="domains-header" isManagingAllSites={ false } />,
			...domainListItems,
		];
	}

	goToEditDomainRoot = ( domain ) => {
		const { selectedSite, currentRoute } = this.props;
		page( getDomainManagementPath( domain.name, domain.type, selectedSite.slug, currentRoute ) );
	};
}

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

export default connect(
	( state, ownProps ) => {
		const siteId = ownProps?.selectedSite?.ID || null;
		const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
		const selectedSite = ownProps?.selectedSite || null;
		const isOnFreePlan = selectedSite?.plan?.is_free || false;
		const siteCount = getSites( state )?.length || 0;

		return {
			currentRoute: getCurrentRoute( state ),
			hasDomainCredit: !! ownProps.selectedSite && hasDomainCredit( state, siteId ),
			hasProductsList: 0 < ( getProductsList( state )?.length ?? 0 ),
			isDomainOnly: isDomainOnlySite( state, siteId ),
			isAtomicSite: isSiteAutomatedTransfer( state, siteId ),
			hasNonPrimaryDomainsFlag: getCurrentUser( state )
				? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
				: false,
			hasSingleSite: siteCount === 1,
			isOnFreePlan,
			userCanManageOptions,
			canSetPrimaryDomain: hasActiveSiteFeature( state, siteId, FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ),
		};
	},
	( dispatch ) => {
		return {
			setPrimaryDomain: ( ...props ) => setPrimaryDomain( ...props )( dispatch ),
			changePrimary: ( domain, mode ) => dispatch( changePrimary( domain, mode ) ),
			successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
		};
	}
)( localize( withLocalizedMoment( List ) ) );
