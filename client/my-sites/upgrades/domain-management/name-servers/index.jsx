/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Header from 'my-sites/upgrades/domain-management/components/header';
import CustomNameserversForm from './custom-nameservers-form';
import WpcomNameserversToggle from './wpcom-nameservers-toggle';
import IcannVerificationCard from 'my-sites/upgrades/domain-management/components/icann-verification/icann-verification-card';
import notices from 'notices';
import paths from 'my-sites/upgrades/paths';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import * as upgradesActions from 'lib/upgrades/actions';
import { WPCOM_DEFAULTS, isWpcomDefaults } from 'lib/domains/nameservers';
import { getSelectedDomain } from 'lib/domains';
import isEmpty from 'lodash/isEmpty';
import { successNotice } from 'state/notices/actions'

const NameServers = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		nameservers: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState() {
		const { nameservers } = this.props;

		return {
			formSubmitting: false,
			nameservers: nameservers.hasLoadedFromServer ? nameservers.list : null
		};
	},

	hasWpcomNameservers() {
		if ( ! this.props.nameservers.hasLoadedFromServer ) {
			return true;
		}

		return isWpcomDefaults( this.state.nameservers );
	},

	componentWillReceiveProps( props ) {
		this.setStateWhenLoadedFromServer( props );
	},

	setStateWhenLoadedFromServer( props ) {
		const prevNameservers = this.props.nameservers,
			nextNameservers = props.nameservers,
			finishedLoading = (
				! prevNameservers.hasLoadedFromServer &&
				nextNameservers.hasLoadedFromServer
			);

		if ( ! finishedLoading ) {
			return;
		}

		this.setState( { nameservers: nextNameservers.list } );
	},

	isLoading() {
		return ! this.props.domains.hasLoadedFromServer || ! this.props.nameservers.hasLoadedFromServer;
	},

	render() {
		const classes = classNames( 'name-servers', {
			'is-placeholder': this.isLoading()
		} );

		return (
			<Main className={ classes }>
				{ this.header() }

				<VerticalNav>
					{ this.wpcomNameserversToggle() }
					{ this.customNameservers() }
					{ this.dnsRecordsNavItem() }
				</VerticalNav>
			</Main>
		);
	},

	wpcomNameserversToggle() {
		return (
			<WpcomNameserversToggle
				selectedDomainName={ this.props.selectedDomainName }
				onToggle={ this.handleToggle }
				enabled={ this.hasWpcomNameservers() } />
		);
	},

	handleToggle() {
		if ( this.hasWpcomNameservers() ) {
			this.setState( { nameservers: [] } );
		} else {
			this.resetToWpcomNameservers();
		}
	},

	resetToWpcomNameservers() {
		if ( isEmpty( this.state.nameservers ) ) {
			this.setState( { nameservers: WPCOM_DEFAULTS } );
		} else {
			this.setState( { nameservers: WPCOM_DEFAULTS }, () => {
				this.saveNameservers();
			} );
		}
	},

	saveNameservers() {
		const { nameservers } = this.state,
			{ selectedDomainName } = this.props;

		this.setState( { formSubmitting: true } );

		upgradesActions.updateNameservers( selectedDomainName, nameservers, ( error ) => {
			if ( error ) {
				notices.error( error.message );
			} else {
				this.props.successNotice( this.translate( 'Yay, the name servers have been successfully updated!' ) );
			}

			this.setState( { formSubmitting: false } );
		} );
	},

	header() {
		return (
			<Header
				onClick={ this.back }
				selectedDomainName={ this.props.selectedDomainName }>
				{ this.translate( 'Name Servers and DNS' ) }
			</Header>
		);
	},

	back() {
		page( paths.domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	},

	customNameservers() {
		if ( this.hasWpcomNameservers() ) {
			return null;
		}

		if ( this.needsVerification() ) {
			return <IcannVerificationCard
				selectedDomainName={ this.props.selectedDomainName }
				explanationContext="name-servers"
				selectedSite={ this.props.selectedSite } />;
		}

		return (
			<CustomNameserversForm
				nameservers={ this.state.nameservers }
				selectedSite={ this.props.selectedSite }
				selectedDomainName={ this.props.selectedDomainName }
				onChange={ this.handleChange }
				onReset={ this.handleReset }
				onSubmit={ this.handleSubmit }
				submitDisabled={ this.state.formSubmitting } />
		);
	},

	needsVerification() {
		if ( ! this.props.domains.hasLoadedFromServer ) {
			return false;
		}

		return getSelectedDomain( this.props ).isPendingIcannVerification;
	},

	handleChange( nameservers ) {
		this.setState( { nameservers } );
	},

	handleReset() {
		this.resetToWpcomNameservers();
	},

	handleSubmit() {
		this.saveNameservers();
	},

	dnsRecordsNavItem() {
		if ( ! this.hasWpcomNameservers() ) {
			return null;
		}

		return (
			<VerticalNavItem
				path={ paths.domainManagementDns( this.props.selectedSite.slug, this.props.selectedDomainName ) }>
				{ this.translate( 'DNS Records' ) }
			</VerticalNavItem>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( NameServers );

