/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { find, findIndex, identity, noop, times } from 'lodash';
import Gridicon from 'gridicons';
import page from 'page';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import DomainWarnings from 'client/my-sites/domains/components/domain-warnings';
import DomainOnly from './domain-only';
import ListItem from './item';
import ListItemPlaceholder from './item-placeholder';
import Main from 'client/components/main';
import paths from 'client/my-sites/domains/paths';
import SectionHeader from 'client/components/section-header';
import Button from 'client/components/button';
import UpgradesNavigation from 'client/my-sites/domains/navigation';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import { setPrimaryDomain } from 'client/lib/upgrades/actions/domain-management';
import DomainListNotice from './domain-list-notice';
import {
	PRIMARY_DOMAIN_CHANGE_SUCCESS,
	PRIMARY_DOMAIN_CHANGE_FAIL,
	PRIMARY_DOMAIN_REVERT_FAIL,
	PRIMARY_DOMAIN_REVERT_SUCCESS,
} from './constants';
import Notice from 'client/components/notice';
import NoticeAction from 'client/components/notice/notice-action';
import { hasDomainCredit } from 'client/state/sites/plans/selectors';
import TrackComponentView from 'client/lib/analytics/track-component-view';
import { isDomainOnlySite } from 'client/state/selectors';
import { isPlanFeaturesEnabled } from 'client/lib/plans';
import DomainToPlanNudge from 'client/blocks/domain-to-plan-nudge';
import { type } from 'client/lib/domains/constants';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'client/state/analytics/actions';

export class List extends React.Component {
	static defaultProps = {
		translate: identity,
		enablePrimaryDomainMode: noop,
		disablePrimaryDomainMode: noop,
		changePrimary: noop,
	};

	state = {
		changePrimaryDomainModeEnabled: false,
		primaryDomainIndex: -1,
		notice: null,
	};

	domainWarnings() {
		if ( this.props.domains.hasLoadedFromServer ) {
			return (
				<DomainWarnings
					domains={ this.props.domains.list }
					position="domain-list"
					selectedSite={ this.props.selectedSite }
					ruleWhiteList={ [
						'newDomainsWithPrimary',
						'newDomains',
						'unverifiedDomainsCanManage',
						'pendingGappsTosAcceptanceDomains',
						'unverifiedDomainsCannotManage',
						'wrongNSMappedDomains',
						'transferStatus',
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
				status="is-info"
				showDismiss={ false }
				text={ translate( 'Free domain available' ) }
				icon="globe"
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

	render() {
		if ( ! this.props.domains ) {
			return null;
		}

		if ( this.props.isDomainOnly ) {
			return (
				<Main>
					<SidebarNavigation />
					<DomainOnly
						hasNotice={ this.isFreshDomainOnlyRegistration() }
						siteId={ this.props.selectedSite.ID }
					/>
				</Main>
			);
		}

		const headerText = this.props.translate( 'Domains', { context: 'A navigation label.' } );

		return (
			<Main wideLayout={ isPlanFeaturesEnabled() }>
				<SidebarNavigation />
				<UpgradesNavigation
					path={ this.props.context.path }
					cart={ this.props.cart }
					selectedSite={ this.props.selectedSite }
				/>
				{ this.domainWarnings() }

				{ this.domainCreditsInfoNotice() }

				<SectionHeader label={ headerText }>{ this.headerButtons() }</SectionHeader>

				<div className="domain-management-list__items">
					{ this.notice() }
					{ this.listItems() }
				</div>

				<DomainToPlanNudge />
			</Main>
		);
	}

	isFreshDomainOnlyRegistration() {
		const domainName = this.props.selectedSite.domain;
		const domain =
			this.props.domains.hasLoadedFromServer &&
			find( this.props.domains.list, ( { name } ) => name === domainName );

		return (
			domain &&
			domain.registrationMoment &&
			this.props
				.moment()
				.subtract( 1, 'day' )
				.isBefore( domain.registrationMoment )
		);
	}

	hideNotice = () => {
		this.setState( { notice: null } );
	};

	notice() {
		const { notice } = this.state;
		if ( ! notice ) {
			return null;
		}

		return (
			<DomainListNotice
				type={ notice.type }
				errorMessage={ notice.error && notice.error.message }
				onDismissClick={ this.hideNotice }
				onUndoClick={ this.undoSetPrimaryDomain }
				domainName={ notice.domainName }
			/>
		);
	}

	undoSetPrimaryDomain = () => {
		if ( ! this.state.notice ) {
			return;
		}

		const { previousDomainName } = this.state.notice;

		this.setPrimaryDomain( previousDomainName ).then(
			() => {
				this.setState( {
					primaryDomainIndex: -1,
					settingPrimaryDomain: false,
					changePrimaryDomainModeEnabled: false,
					notice: {
						type: PRIMARY_DOMAIN_REVERT_SUCCESS,
						domainName: previousDomainName,
					},
				} );
			},
			error => {
				this.setState( {
					notice: {
						primaryDomainIndex: -1,
						settingPrimaryDomain: false,
						changePrimaryDomainModeEnabled: false,
						type: PRIMARY_DOMAIN_REVERT_FAIL,
						domainName: previousDomainName,
						error,
					},
				} );
			}
		);
		const previousDomainIndex = findIndex( this.props.domains.list, { name: previousDomainName } );

		this.setState( {
			notice: null,
			changePrimaryDomainModeEnabled: true,
			primaryDomainIndex: previousDomainIndex,
			settingPrimaryDomain: true,
		} );

		this.props.undoChangePrimary( this.props.domains.list[ previousDomainIndex ] );
	};

	clickAddDomain = () => {
		this.props.addDomainClick();
		page( `/domains/add/${ this.props.selectedSite.slug }` );
	};

	enableChangePrimaryDomainMode = () => {
		this.props.enablePrimaryDomainMode();
		this.setState( {
			changePrimaryDomainModeEnabled: true,
			primaryDomainIndex: findIndex( this.props.domains.list, { isPrimary: true } ),
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
		if ( this.props.selectedSite && this.props.selectedSite.jetpack ) {
			return null;
		}

		if ( this.state.changePrimaryDomainModeEnabled ) {
			return (
				<Button
					disabled={ this.state.settingPrimaryDomain }
					ref="cancelChangePrimaryButton"
					borderless
					compact
					onClick={ this.disableChangePrimaryDomainMode }
				>
					<Gridicon icon="cross" size={ 24 } />
				</Button>
			);
		}
		return (
			<div>
				{ this.changePrimaryButton() }
				{ this.addDomainButton() }
			</div>
		);
	}

	changePrimaryButton() {
		if ( ! this.props.domains.list || this.props.domains.list.length < 2 ) {
			return null;
		}

		return (
			<Button
				compact
				className="domain-management-list__change-primary-button"
				onClick={ this.enableChangePrimaryDomainMode }
			>
				{ this.props.translate( 'Change Primary', {
					context: 'Button label for changing primary domain',
				} ) }
			</Button>
		);
	}

	addDomainButton() {
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			return null;
		}

		return (
			<Button
				primary
				compact
				className="domain-management-list__add-a-domain"
				onClick={ this.clickAddDomain }
			>
				{ this.props.translate( 'Add Domain' ) }
			</Button>
		);
	}

	setPrimaryDomain( domainName ) {
		return new Promise( ( resolve, reject ) => {
			this.props.setPrimaryDomain( this.props.selectedSite.ID, domainName, ( error, data ) => {
				if ( ! error && data && data.success ) {
					page.redirect( paths.domainManagementList( this.props.selectedSite.slug ) );
					resolve();
				} else {
					reject( error );
				}
			} );
		} );
	}

	handleUpdatePrimaryDomain = ( index, domain ) => {
		if ( this.state.settingPrimaryDomain ) {
			return;
		}

		this.props.changePrimary( domain );
		const currentPrimaryIndex = findIndex( this.props.domains.list, { isPrimary: true } ),
			currentPrimaryName = this.props.domains.list[ currentPrimaryIndex ].name;

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
					notice: {
						type: PRIMARY_DOMAIN_CHANGE_SUCCESS,
						domainName: domain.name,
						previousDomainName: currentPrimaryName,
					},
				} );
			},
			error => {
				this.setState( {
					settingPrimaryDomain: false,
					primaryDomainIndex: currentPrimaryIndex,
					notice: {
						type: PRIMARY_DOMAIN_CHANGE_FAIL,
						domainName: domain.name,
						error,
					},
				} );
			}
		);
	};

	listItems() {
		if ( ! this.props.domains.hasLoadedFromServer ) {
			return times( 3, n => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		const domains = this.props.selectedSite.jetpack
			? this.props.domains.list.filter( domain => domain.type !== type.WPCOM )
			: this.props.domains.list;

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
				/>
			);
		} );
	}

	goToEditDomainRoot = domain => {
		if ( domain.type !== type.TRANSFER ) {
			page( paths.domainManagementEdit( this.props.selectedSite.slug, domain.name ) );
		} else {
			page( paths.domainManagementTransferIn( this.props.selectedSite.slug, domain.name ) );
		}
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

const undoChangePrimary = domain =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Undo change Primary Domain in List',
			'Domain Name (Reverted to)',
			domain.name
		),
		recordTracksEvent( 'calypso_domain_management_list_undo_change_primary_domain_click', {
			section: domain.type,
		} )
	);

export default connect(
	( state, ownProps ) => {
		const siteId = ownProps.selectedSite.ID;

		return {
			hasDomainCredit: !! ownProps.selectedSite && hasDomainCredit( state, siteId ),
			isDomainOnly: isDomainOnlySite( state, siteId ),
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
			undoChangePrimary: domain => dispatch( undoChangePrimary( domain ) ),
		};
	}
)( localize( List ) );
