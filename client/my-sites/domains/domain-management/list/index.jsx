/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find, findIndex, get, identity, noop, times, isEmpty } from 'lodash';
import page from 'page';
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import DomainOnly from './domain-only';
import ListItemPlaceholder from './item-placeholder';
import Main from 'calypso/components/main';
import { domainManagementRoot, domainManagementList } from 'calypso/my-sites/domains/paths';
import { Button, Card, CompactCard } from '@automattic/components';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import EmptyContent from 'calypso/components/empty-content';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
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
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { getDomainManagementPath } from './utils';
import DomainItem from './domain-item';
import ListHeader from './list-header';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import InfoPopover from 'calypso/components/info-popover';
import ExternalLink from 'calypso/components/external-link';
import HeaderCart from 'calypso/my-sites/checkout/cart/header-cart';

/**
 * Style dependencies
 */
import './style.scss';
import 'calypso/my-sites/domains/style.scss';

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
		translate: identity,
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

	domainCreditsInfoNotice() {
		if ( ! this.props.hasDomainCredit ) {
			return null;
		}

		const { translate } = this.props;

		return (
			<Notice
				status="is-success"
				showDismiss={ false }
				text={ translate( 'Free domain available' ) }
				icon="info-outline"
				className="domain-management__claim-free-domain"
			>
				<NoticeAction
					onClick={ this.props.clickClaimDomainNotice }
					href={ `/domains/add/${ this.props.selectedSite.slug }` }
				>
					{ translate( 'Claim Free Domain' ) }
					<TrackComponentView
						eventName={ 'calypso_domain_credit_reminder_impression' }
						eventProperties={ { cta_name: 'domain_info_notice' } }
					/>
				</NoticeAction>
			</Notice>
		);
	}

	filterOutWpcomDomains( domains ) {
		return domains.filter(
			( domain ) => domain.type !== type.WPCOM || domain.isWpcomStagingDomain
		);
	}

	renderNewDesign() {
		return (
			<>
				<div className="domains__header">
					<FormattedHeader
						brandFont
						className="domain-management__page-heading"
						headerText={ this.props.translate( 'Site Domains' ) }
						align="left"
					/>
					<div className="domains__header-buttons">
						<HeaderCart
							selectedSite={ this.props.selectedSite }
							currentRoute={ this.props.currentRoute }
						/>
						{ this.addDomainButton() }
					</div>
				</div>

				{ this.domainWarnings() }
				{ this.domainCreditsInfoNotice() }

				<div className="domain-management-list__primary-domain">{ this.renderPrimaryDomain() }</div>
				<div className="domain-management-list__items">{ this.listNewItems() }</div>
				<DomainToPlanNudge />
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

			if ( isEmpty( this.filterOutWpcomDomains( this.props.domains ) ) ) {
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

	clickAddDomain = () => {
		this.props.addDomainClick();
		page( `/domains/add/${ this.props.selectedSite.slug }` );
	};

	enableChangePrimaryDomainMode = () => {
		this.props.enablePrimaryDomainMode();
		this.setState( {
			changePrimaryDomainModeEnabled: true,
			primaryDomainIndex: findIndex( this.props.domains, { isPrimary: true } ),
		} );
	};

	disableChangePrimaryDomainMode = () => {
		this.props.disablePrimaryDomainMode();
		this.setState( {
			changePrimaryDomainModeEnabled: false,
			primaryDomainIndex: -1,
		} );
	};

	addDomainButton() {
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			return null;
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Button
				primary
				compact
				className="domain-management-list__add-a-domain"
				onClick={ this.clickAddDomain }
			>
				{ this.props.translate( 'Add a domain to this site' ) }
			</Button>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
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

	handleUpdatePrimaryDomainOptionClick = ( index, domain ) => {
		return this.handleUpdatePrimaryDomain( index, domain, 'item_option_click' );
	};

	handleUpdatePrimaryDomain = ( index, domain, mode = 'item_select_legacy' ) => {
		const { translate } = this.props;

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

				this.props.successNotice(
					translate(
						'Primary domain changed: all domains will redirect to {{em}}%(domainName)s{{/em}}.',
						{ args: { domainName: domain.name }, components: { em: <em /> } }
					),
					{ duration: 10000, isPersistent: true }
				);
			},
			( error ) => {
				this.setState( {
					settingPrimaryDomain: false,
					primaryDomainIndex: currentPrimaryIndex,
				} );
				this.props.errorNotice(
					error.message ||
						translate( "Something went wrong and we couldn't change your primary domain." ),
					{ duration: 10000, isPersistent: true }
				);
			}
		);
	};

	shouldUpgradeToMakeDomainPrimary( domain ) {
		const { isDomainOnly, isOnFreePlan, hasNonPrimaryDomainsFlag } = this.props;

		return (
			hasNonPrimaryDomainsFlag &&
			isOnFreePlan &&
			( domain.type === type.REGISTERED || domain.type === type.MAPPED ) &&
			! isDomainOnly &&
			! domain.isPrimary &&
			! domain.isWPCOMDomain &&
			! domain.isWpcomStagingDomain
		);
	}

	renderPrimaryDomain() {
		const { domains, selectedSite, translate } = this.props;
		const primaryDomain = find( domains, 'isPrimary' );

		if ( this.isLoading() || ! primaryDomain ) {
			return <ListItemPlaceholder />;
		}

		const moreThanOneDomain = domains.filter( ( domain ) => domain?.canSetAsPrimary ).length > 1;

		return [
			<CompactCard className="list__header-primary-domain" key="primary-domain-header">
				<div className="list__header-primary-domain-info">
					{ translate( 'Primary domain' ) }
					<InfoPopover iconSize={ 18 }>
						{ translate(
							'Your primary domain is the address visitors will see in their address bar when visiting your blog. All other domains will redirect to the primary domain.'
						) }
					</InfoPopover>
				</div>
				<div className="list__header-primary-domain-buttons">
					<Button
						compact
						disabled={ ! moreThanOneDomain }
						className="list__change-primary-domain"
						onClick={
							this.state.changePrimaryDomainModeEnabled
								? this.disableChangePrimaryDomainMode
								: this.enableChangePrimaryDomainMode
						}
					>
						{ this.state.changePrimaryDomainModeEnabled
							? translate( 'Cancel primary domain change' )
							: translate( 'Change primary domain' ) }
					</Button>
				</div>
			</CompactCard>,
			<CompactCard className="list__item-primary-domain" key="primary-domain-content">
				<div className="list__header-primary-domain-content">
					<ExternalLink
						className="list__header-primary-domain-url"
						href={ selectedSite.URL }
						title={ translate( 'Launch your site' ) }
						target="_blank"
						icon={ true }
					>
						{ primaryDomain.name }
					</ExternalLink>
				</div>
			</CompactCard>,
		];
	}

	listNewItems() {
		if ( this.isLoading() ) {
			return times( 3, ( n ) => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		const {
			currentRoute,
			translate,
			selectedSite,
			renderAllSites,
			isDomainOnly,
			hasSingleSite,
		} = this.props;

		const { changePrimaryDomainModeEnabled, primaryDomainIndex, settingPrimaryDomain } = this.state;

		const domains =
			selectedSite.jetpack || ( renderAllSites && isDomainOnly )
				? this.filterOutWpcomDomains( this.props.domains )
				: this.props.domains;

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
				disabled={ settingPrimaryDomain || changePrimaryDomainModeEnabled }
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
			<ListHeader
				key="domains-header"
				headerClasses={ {
					'domain-item__enable-selection': this.state.changePrimaryDomainModeEnabled,
				} }
			/>,
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
