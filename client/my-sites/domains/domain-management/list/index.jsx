/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find, findIndex, get, identity, noop, times, isEmpty } from 'lodash';
import Gridicon from 'components/gridicon';
import page from 'page';
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import DomainOnly from './domain-only';
import ListItem from './item';
import ListItemPlaceholder from './item-placeholder';
import Main from 'components/main';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementTransferIn,
} from 'my-sites/domains/paths';
import SectionHeader from 'components/section-header';
import { Button } from '@automattic/components';
import PlansNavigation from 'my-sites/plans/navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { setPrimaryDomain } from 'state/sites/domains/actions';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import EmptyContent from 'components/empty-content';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import TrackComponentView from 'lib/analytics/track-component-view';
import canCurrentUser from 'state/selectors/can-current-user';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import DomainToPlanNudge from 'blocks/domain-to-plan-nudge';
import { type } from 'lib/domains/constants';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import { withLocalizedMoment } from 'components/localized-moment';
import { successNotice, errorNotice } from 'state/notices/actions';
/**
 * Style dependencies
 */
import './style.scss';
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'state/current-user/constants';

export class List extends React.Component {
	static propTypes = {
		selectedSite: PropTypes.object.isRequired,
		domains: PropTypes.array.isRequired,
		isRequestingDomains: PropTypes.bool,
		cart: PropTypes.object,
		context: PropTypes.object,
		renderAllSites: PropTypes.bool,
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
					ruleWhiteList={ [
						'newDomainsWithPrimary',
						'newDomains',
						'unverifiedDomainsCanManage',
						'pendingGSuiteTosAcceptanceDomains',
						'unverifiedDomainsCannotManage',
						'wrongNSMappedDomains',
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
		return domains.filter( domain => domain.type !== type.WPCOM || domain.isWpcomStagingDomain );
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
		const sectionLabel = this.props.renderAllSites ? this.props.selectedSite.title : null;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Main wideLayout>
				<DocumentHead title={ headerText } />
				<SidebarNavigation />
				{ ! this.props.renderAllSites && (
					<FormattedHeader
						className="domain-management__page-heading"
						headerText={ this.props.translate( 'Domains' ) }
						align="left"
					/>
				) }
				{ ! this.props.renderAllSites && (
					<PlansNavigation cart={ this.props.cart } path={ this.props.context.path } />
				) }
				{ ! this.props.renderAllSites && this.domainWarnings() }

				{ ! this.props.renderAllSites && this.domainCreditsInfoNotice() }

				<SectionHeader label={ sectionLabel }>{ this.headerButtons() }</SectionHeader>

				<div className="domain-management-list__items">{ this.listItems() }</div>

				<DomainToPlanNudge />
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

	headerButtons() {
		if ( this.props.selectedSite && this.props.selectedSite.jetpack && ! this.props.isAtomicSite ) {
			return null;
		}

		if ( this.state.changePrimaryDomainModeEnabled ) {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return (
				<Button
					disabled={ this.state.settingPrimaryDomain }
					// eslint-disable-next-line react/no-string-refs
					ref="cancelChangePrimaryButton"
					borderless
					compact
					className="domain-management-list__cancel-change-primary-button"
					onClick={ this.disableChangePrimaryDomainMode }
				>
					<Gridicon icon="cross" size={ 24 } />
				</Button>
			);
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}
		return (
			<>
				{ this.changePrimaryButton() }
				{ this.addDomainButton() }
			</>
		);
	}

	changePrimaryButton() {
		if ( ! this.props.domains || this.props.domains.length < 2 ) {
			return null;
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Button
				compact
				className="domain-management-list__change-primary-button"
				onClick={ this.enableChangePrimaryDomainMode }
			>
				{ this.props.translate( 'Change primary', {
					context: 'Button label for changing primary domain',
				} ) }
			</Button>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

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
				{ this.props.translate( 'Add domain' ) }
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

	handleUpdatePrimaryDomain = ( index, domain ) => {
		const { translate } = this.props;

		if ( this.state.settingPrimaryDomain ) {
			return;
		}

		this.props.changePrimary( domain );
		const currentPrimaryIndex = findIndex( this.props.domains, { isPrimary: true } ),
			currentPrimaryName = this.props.domains[ currentPrimaryIndex ].name;

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
			error => {
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

	listItems() {
		if ( this.isLoading() ) {
			return times( 3, n => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		const domains =
			this.props.selectedSite.jetpack || ( this.props.renderAllSites && this.props.isDomainOnly )
				? this.filterOutWpcomDomains( this.props.domains )
				: this.props.domains;

		return domains.map( ( domain, index ) => {
			return (
				<ListItem
					key={ index + domain.name }
					domain={ domain }
					enableSelection={ this.state.changePrimaryDomainModeEnabled && domain.canSetAsPrimary }
					isSelected={ index === this.state.primaryDomainIndex }
					selectionIndex={ index }
					busy={ this.state.settingPrimaryDomain && index === this.state.primaryDomainIndex }
					busyMessage={ this.props.translate( 'Setting Primary Domain…', {
						context: 'Shows up when the primary domain is changing and the user is waiting',
					} ) }
					onSelect={ this.handleUpdatePrimaryDomain }
					onClick={ this.goToEditDomainRoot }
					shouldUpgradeToMakePrimary={ this.shouldUpgradeToMakeDomainPrimary( domain ) }
					onUpgradeClick={ this.goToPlans }
				/>
			);
		} );
	}

	goToEditDomainRoot = domain => {
		if ( domain.type !== type.TRANSFER ) {
			page( domainManagementEdit( this.props.selectedSite.slug, domain.name ) );
		} else {
			page( domainManagementTransferIn( this.props.selectedSite.slug, domain.name ) );
		}
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

const changePrimary = domain =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Changed Primary Domain to in List',
			'Domain Name',
			domain.name
		),
		recordTracksEvent( 'calypso_domain_management_list_change_primary_domain_click', {
			section: domain.type,
		} )
	);

export default connect(
	( state, ownProps ) => {
		const siteId = get( ownProps, 'selectedSite.ID', null );
		const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
		const selectedSite = get( ownProps, 'selectedSite', null );
		const isOnFreePlan = get( selectedSite, 'plan.is_free', false );

		return {
			hasDomainCredit: !! ownProps.selectedSite && hasDomainCredit( state, siteId ),
			isDomainOnly: isDomainOnlySite( state, siteId ),
			isAtomicSite: isSiteAutomatedTransfer( state, siteId ),
			hasNonPrimaryDomainsFlag: getCurrentUser( state )
				? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
				: false,
			isOnFreePlan,
			userCanManageOptions,
		};
	},
	dispatch => {
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
			changePrimary: domain => dispatch( changePrimary( domain ) ),
			successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
			upsellUpgradeClick: () => dispatch( upsellUpgradeClick() ),
		};
	}
)( localize( withLocalizedMoment( List ) ) );
