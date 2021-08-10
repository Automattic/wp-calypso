/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find, findIndex, get, times, isEmpty } from 'lodash';
import page from 'page';
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import DomainOnly from './domain-only';
import ListItemPlaceholder from './item-placeholder';
import Main from 'calypso/components/main';
import { domainManagementRoot, domainManagementList } from 'calypso/my-sites/domains/paths';
import { Card } from '@automattic/components';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import EmptyContent from 'calypso/components/empty-content';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import DomainToPlanNudge from 'calypso/blocks/domain-to-plan-nudge';
import { type } from 'calypso/lib/domains/constants';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getSites from 'calypso/state/selectors/get-sites';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import {
	filterOutWpcomDomains,
	getDomainManagementPath,
	showUpdatePrimaryDomainSuccessNotice,
	showUpdatePrimaryDomainErrorNotice,
} from './utils';
import DomainItem from './domain-item';
import ListHeader from './list-header';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import HeaderCart from 'calypso/my-sites/checkout/cart/header-cart';
import AddDomainButton from 'calypso/my-sites/domains/domain-management/list/add-domain-button';
import EmptyDomainsListCard from 'calypso/my-sites/domains/domain-management/list/empty-domains-list-card';
import WpcomDomainItem from 'calypso/my-sites/domains/domain-management/list/wpcom-domain-item';

/**
 * Style dependencies
 */
import './style.scss';
import 'calypso/my-sites/domains/style.scss';

const noop = () => {};

export class List extends React.Component {
	static propTypes = {
		selectedSite: PropTypes.object.isRequired,
		domains: PropTypes.array.isRequired,
		isRequestingDomains: PropTypes.bool,
		context: PropTypes.object,
		renderAllSites: PropTypes.bool,
		hasSingleSite: PropTypes.bool,
	};

	static defaultProps = {
		enablePrimaryDomainMode: noop,
		disablePrimaryDomainMode: noop,
		changePrimary: noop,
	};

	state = {
		settingPrimaryDomain: false,
		changePrimaryDomainModeEnabled: false,
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
		const { selectedSite, domains, currentRoute, translate } = this.props;
		const { changePrimaryDomainModeEnabled, settingPrimaryDomain } = this.state;
		const disabled = settingPrimaryDomain || changePrimaryDomainModeEnabled;

		const nonWpcomDomains = filterOutWpcomDomains( domains );
		const wpcomDomain = domains.find(
			( domain ) => domain.type === type.WPCOM || domain.isWpcomStagingDomain
		);

		return (
			<>
				<div className="domains__header">
					<FormattedHeader
						brandFont
						className="domain-management__page-heading"
						headerText={ translate( 'Site Domains' ) }
						subHeaderText={ translate( 'Manage the domains connected to your site.' ) }
						align="left"
					/>
					<div className="domains__header-buttons">
						<HeaderCart selectedSite={ selectedSite } currentRoute={ currentRoute } />
						{ this.addDomainButton() }
					</div>
				</div>

				{ this.domainWarnings() }

				{ ! this.isLoading() && nonWpcomDomains.length === 0 && (
					<EmptyDomainsListCard
						selectedSite={ selectedSite }
						hasDomainCredit={ this.props.hasDomainCredit }
					/>
				) }

				<div className="domain-management-list__items">{ this.listNewItems() }</div>

				{ ! this.isLoading() && nonWpcomDomains.length > 0 && (
					<EmptyDomainsListCard
						selectedSite={ selectedSite }
						hasDomainCredit={ this.props.hasDomainCredit }
						isCompact={ true }
					/>
				) }

				<DomainToPlanNudge />

				{ wpcomDomain && (
					<WpcomDomainItem
						key="wpcom-domain-item"
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

			if ( isEmpty( filterOutWpcomDomains( this.props.domains ) ) ) {
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
			! this.isLoading() && find( this.props.domains, ( { name } ) => name === domainName );

		return (
			domain &&
			domain.registrationDate &&
			this.props
				.moment()
				.subtract( 30, 'minutes' )
				.isBefore( this.props.moment( domain.registrationDate ) )
		);
	}

	addDomainButton() {
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			return null;
		}

		return <AddDomainButton />;
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

		const currentPrimaryIndex = findIndex( this.props.domains, { isPrimary: true } );
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
		const currentPrimaryIndex = findIndex( this.props.domains, { isPrimary: true } );
		const currentPrimaryName = this.props.domains[ currentPrimaryIndex ].name;

		if ( domain.name === currentPrimaryName ) {
			// user clicked the current primary domain
			this.setState( {
				changePrimaryDomainModeEnabled: false,
			} );
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
					changePrimaryDomainModeEnabled: false,
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
			return times( 3, ( n ) => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		const { currentRoute, translate, selectedSite, hasSingleSite } = this.props;

		const { changePrimaryDomainModeEnabled, primaryDomainIndex, settingPrimaryDomain } = this.state;

		const domains = filterOutWpcomDomains( this.props.domains );
		const disabled = settingPrimaryDomain || changePrimaryDomainModeEnabled;

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
				isChecked={ changePrimaryDomainModeEnabled && index === primaryDomainIndex }
				busyMessage={ this.props.translate( 'Setting Primary Domain…', {
					context: 'Shows up when the primary domain is changing and the user is waiting',
				} ) }
				disabled={ disabled }
				enableSelection={ changePrimaryDomainModeEnabled && domain.canSetAsPrimary }
				selectionIndex={ index }
				onMakePrimaryClick={ this.handleUpdatePrimaryDomainOptionClick }
				onSelect={ this.handleUpdatePrimaryDomain }
				onUpgradeClick={ this.goToPlans }
				shouldUpgradeToMakePrimary={ this.shouldUpgradeToMakeDomainPrimary( domain ) }
			/>
		) );

		const manageAllDomainsLink = hasSingleSite ? null : (
			<Card className="list__view-all" key="manage-all-domains" href={ domainManagementRoot() }>
				{ translate( 'Manage all your domains' ) }
			</Card>
		);

		return [
			<QuerySitePurchases key="query-purchases" siteId={ selectedSite.ID } />,
			domains.length > 0 && (
				<ListHeader
					key="domains-header"
					headerClasses={ {
						'domain-item__enable-selection': this.state.changePrimaryDomainModeEnabled,
					} }
					isManagingAllSites={ false }
				/>
			),
			...domainListItems,
			manageAllDomainsLink,
		];
	}

	goToEditDomainRoot = ( domain ) => {
		const { selectedSite, currentRoute } = this.props;
		page( getDomainManagementPath( domain.name, domain.type, selectedSite.slug, currentRoute ) );
	};

	goToPlans = () => {
		this.props.upsellUpgradeClick();
		page( `/plans/${ this.props.selectedSite.slug }` );
	};
}

const addDomainClick = () =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Management', 'Clicked "Add Domain" Button in List' ),
		recordTracksEvent( 'calypso_domain_management_list_add_domain_click' )
	);

const enablePrimaryDomainMode = () =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Management', 'Clicked "Change Primary" button in List' ),
		recordTracksEvent( 'calypso_domain_management_list_enable_primary_domain_mode_click' )
	);

const disablePrimaryDomainMode = () =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "X" button to disable change primary mode in List'
		),
		recordTracksEvent( 'calypso_domain_management_list_disable_primary_mode_click' )
	);

const upsellUpgradeClick = () =>
	recordTracksEvent( 'calypso_domain_management_make_primary_plan_upgrade_click' );

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
		const siteId = get( ownProps, 'selectedSite.ID', null );
		const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
		const selectedSite = get( ownProps, 'selectedSite', null );
		const isOnFreePlan = get( selectedSite, 'plan.is_free', false );
		const siteCount = get( getSites( state ), 'length', 0 );

		return {
			currentRoute: getCurrentRoute( state ),
			hasDomainCredit: !! ownProps.selectedSite && hasDomainCredit( state, siteId ),
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
			clickClaimDomainNotice: () =>
				dispatch(
					recordTracksEvent( 'calypso_domain_credit_reminder_click', {
						cta_name: 'domain_info_notice',
					} )
				),
			setPrimaryDomain: ( ...props ) => setPrimaryDomain( ...props )( dispatch ),
			addDomainClick: () => dispatch( addDomainClick() ),
			enablePrimaryDomainMode: () => dispatch( enablePrimaryDomainMode() ),
			disablePrimaryDomainMode: () => dispatch( disablePrimaryDomainMode() ),
			changePrimary: ( domain, mode ) => dispatch( changePrimary( domain, mode ) ),
			successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
			upsellUpgradeClick: () => dispatch( upsellUpgradeClick() ),
		};
	}
)( localize( withLocalizedMoment( List ) ) );
