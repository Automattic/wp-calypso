/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import times from 'lodash/times';
import findIndex from 'lodash/findIndex';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import config from 'config';
import DomainWarnings from 'my-sites/upgrades/components/domain-warnings';
import ListItem from './item';
import ListItemPlaceholder from './item-placeholder';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Gridicon from 'components/gridicon';
import { setPrimaryDomain } from 'lib/upgrades/actions/domain-management';
import DomainListNotice from './domain-list-notice';
import {
	PRIMARY_DOMAIN_CHANGE_SUCCESS,
	PRIMARY_DOMAIN_CHANGE_FAIL,
	PRIMARY_DOMAIN_REVERT_FAIL,
	PRIMARY_DOMAIN_REVERT_SUCCESS
} from './constants';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { isPlanFeaturesEnabled } from 'lib/plans';

export const List = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'list' ) ],

	getInitialState() {
		return {
			changePrimaryDomainModeEnabled: false,
			primaryDomainIndex: -1,
			notice: null
		};
	},

	domainWarnings() {
		if ( this.props.domains.hasLoadedFromServer ) {
			return <DomainWarnings
				domains={ this.props.domains.list }
				selectedSite={ this.props.selectedSite }
				ruleWhiteList={ [ 'newDomainsWithPrimary', 'newDomains', 'unverifiedDomains', 'pendingGappsTosAcceptanceDomains' ] } />;
		}
	},

	domainCreditsInfoNotice() {
		if ( ! this.props.hasDomainCredit ) {
			return null;
		}

		const eventName = 'calypso_domain_credit_reminder_impression';
		const eventProperties = { cta_name: 'domain_info_notice' };
		return (
			<Notice
				status="is-info"
				showDismiss={ false }
				text={ this.translate( 'Free domain available' ) }
				icon="globe">
				<NoticeAction onClick={ this.props.clickClaimDomainNotice } href={ `/domains/add/${ this.props.selectedSite.slug }` }>
					{ this.translate( 'Claim Free Domain' ) }
					<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
				</NoticeAction>
			</Notice>
		);

	},

	render() {
		const headerText = this.translate( 'Domains', { context: 'A navigation label.' } );

		if ( ! this.props.domains ) {
			return null;
		}

		return (
			<Main wideLayout={ isPlanFeaturesEnabled() }>
				<SidebarNavigation />
				<UpgradesNavigation
					path={ this.props.context.path }
					cart={ this.props.cart }
					selectedSite={ this.props.selectedSite }
					sitePlans={ this.props.sitePlans } />
				{ this.domainWarnings() }

				{ this.domainCreditsInfoNotice() }

				<SectionHeader label={ headerText }>
					{ this.headerButtons() }
				</SectionHeader>

				<div className="domain-management-list__items">
					{ this.notice() }
					{ this.listItems() }
				</div>
			</Main>
		);
	},

	hideNotice() {
		this.setState( { notice: null } );
	},

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
			/> );
	},

	undoSetPrimaryDomain() {
		if ( ! this.state.notice ) {
			return;
		}

		const { previousDomainName } = this.state.notice;

		this.setPrimaryDomain( previousDomainName ).then( () => {
			this.setState( {
				primaryDomainIndex: -1,
				settingPrimaryDomain: false,
				changePrimaryDomainModeEnabled: false,
				notice: {
					type: PRIMARY_DOMAIN_REVERT_SUCCESS,
					domainName: previousDomainName
				}
			} );
		}, ( error ) => {
			this.setState( {
				notice: {
					primaryDomainIndex: -1,
					settingPrimaryDomain: false,
					changePrimaryDomainModeEnabled: false,
					type: PRIMARY_DOMAIN_REVERT_FAIL,
					domainName: previousDomainName,
					error
				}
			} );
		} );
		const previousDomainIndex = findIndex( this.props.domains.list, { name: previousDomainName } );

		this.setState( {
			notice: null,
			changePrimaryDomainModeEnabled: true,
			primaryDomainIndex: previousDomainIndex,
			settingPrimaryDomain: true
		} );

		this.recordEvent( 'changePrimary', this.props.domains.list[ previousDomainIndex ] );
	},

	clickAddDomain() {
		this.recordEvent( 'addDomainClick' );
		page( `/domains/add/${ this.props.selectedSite.slug }` );
	},

	enableChangePrimaryDomainMode() {
		this.recordEvent( 'enablePrimaryDomainMode' );
		this.setState( {
			changePrimaryDomainModeEnabled: true,
			primaryDomainIndex: findIndex( this.props.domains.list, { isPrimary: true } )
		} );
	},

	disableChangePrimaryDomainMode() {
		this.recordEvent( 'disablePrimaryDomainMode' );
		this.setState( {
			changePrimaryDomainModeEnabled: false,
			primaryDomainIndex: -1
		} );
	},

	headerButtons() {
		if ( this.state.changePrimaryDomainModeEnabled ) {
			return (
				<Button
					disabled={ this.state.settingPrimaryDomain }
					ref="cancelChangePrimaryButton"
					borderless
					compact
					onClick={ this.disableChangePrimaryDomainMode }>
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
	},

	changePrimaryButton() {
		if ( ! this.props.domains.list || this.props.domains.list.length < 2 ) {
			return null;
		}

		return (
			<Button
				compact
				className="domain-management-list__change-primary-button"
				onClick={ this.enableChangePrimaryDomainMode }>
				{ this.translate( 'Change Primary', { context: 'Button label for changing primary domain' } ) }
			</Button>
		);
	},

	addDomainButton() {
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			return null;
		}

		return (
			<Button
				primary
				compact
				className="domain-management-list__add-a-domain"
				onClick={ this.clickAddDomain }>
				{ this.translate( 'Add Domain' ) }
			</Button>
		);
	},

	setPrimaryDomain: function( domainName ) {
		return new Promise( ( resolve, reject ) => {
			setPrimaryDomain( this.props.selectedSite.ID, domainName, ( error, data ) => {
				if ( ! error && data && data.success ) {
					page.redirect( paths.domainManagementList( this.props.selectedSite.slug ) );
					resolve();
				} else {
					reject( error );
				}
			} );
		} );
	},

	handleUpdatePrimaryDomain( index, domain ) {
		if ( this.state.settingPrimaryDomain ) {
			return;
		}

		this.recordEvent( 'changePrimary', domain );
		const currentPrimaryIndex = findIndex( this.props.domains.list, { isPrimary: true } ),
			currentPrimaryName = this.props.domains.list [ currentPrimaryIndex ].name;

		if ( domain.name === currentPrimaryName ) {
			// user clicked the current primary domain
			this.setState( {
				changePrimaryDomainModeEnabled: false
			} );
			return;
		}

		this.setState( {
			primaryDomainIndex: index,
			settingPrimaryDomain: true
		} );

		return this.setPrimaryDomain( domain.name ).then( () => {
			this.setState( {
				settingPrimaryDomain: false,
				changePrimaryDomainModeEnabled: false,
				notice: {
					type: PRIMARY_DOMAIN_CHANGE_SUCCESS,
					domainName: domain.name,
					previousDomainName: currentPrimaryName
				}
			} );
		}, error => {
			this.setState( {
				settingPrimaryDomain: false,
				primaryDomainIndex: currentPrimaryIndex,
				notice: {
					type: PRIMARY_DOMAIN_CHANGE_FAIL,
					domainName: domain.name,
					error
				}
			} );
		} );
	},

	listItems() {
		if ( ! this.props.domains.hasLoadedFromServer ) {
			return times( 3, n => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		return this.props.domains.list.map( ( domain, index ) => {
			return (
				<ListItem
					key={ domain.name }
					domain={ domain }
					enableSelection={ this.state.changePrimaryDomainModeEnabled }
					isSelected={ index === this.state.primaryDomainIndex }
					selectionIndex={ index }
					busy={ this.state.settingPrimaryDomain && index === this.state.primaryDomainIndex }
					busyMessage={ this.translate( 'Setting Primary Domain…', { context: 'Shows up when the primary' +
						' domain is changing and the user is waiting' } ) }
					onSelect={ this.handleUpdatePrimaryDomain }
					onClick={ this.goToEditDomainRoot } />
			);
		} );
	},

	goToEditDomainRoot( domain ) {
		page( paths.domainManagementEdit( this.props.selectedSite.slug, domain.name ) );
	}
} );

export default connect( ( state, ownProps ) => {
	return {
		hasDomainCredit: !! ownProps.selectedSite && hasDomainCredit( state, ownProps.selectedSite.ID )
	};
}, ( dispatch ) => {
	return {
		clickClaimDomainNotice: () => dispatch( recordTracksEvent(
			'calypso_domain_credit_reminder_click',
			{
				cta_name: 'domain_info_notice'
			}
		) )
	};
} )( List );
