/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'client/components/main';
import Header from 'client/my-sites/domains/domain-management/components/header';
import CustomNameserversForm from './custom-nameservers-form';
import WpcomNameserversToggle from './wpcom-nameservers-toggle';
import IcannVerificationCard from 'client/my-sites/domains/domain-management/components/icann-verification/icann-verification-card';
import DnsTemplates from './dns-templates';
import paths from 'client/my-sites/domains/paths';
import VerticalNav from 'client/components/vertical-nav';
import VerticalNavItem from 'client/components/vertical-nav/item';
import * as upgradesActions from 'client/lib/upgrades/actions';
import { WPCOM_DEFAULTS, isWpcomDefaults } from 'client/lib/domains/nameservers';
import { getSelectedDomain } from 'client/lib/domains';
import { isEmpty } from 'lodash';
import { errorNotice, successNotice } from 'client/state/notices/actions';

class NameServers extends React.Component {
	static propTypes = {
		domains: PropTypes.object.isRequired,
		nameservers: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	state = {
		formSubmitting: false,
		nameservers: this.props.nameservers.hasLoadedFromServer ? this.props.nameservers.list : null,
	};

	componentWillReceiveProps( props ) {
		this.setStateWhenLoadedFromServer( props );
	}

	hasWpcomNameservers = () => {
		if ( ! this.props.nameservers.hasLoadedFromServer ) {
			return true;
		}

		return isWpcomDefaults( this.state.nameservers );
	};

	setStateWhenLoadedFromServer( props ) {
		const prevNameservers = this.props.nameservers;
		const nextNameservers = props.nameservers;
		const finishedLoading =
			! prevNameservers.hasLoadedFromServer && nextNameservers.hasLoadedFromServer;

		if ( ! finishedLoading ) {
			return;
		}

		this.setState( { nameservers: nextNameservers.list } );
	}

	isLoading() {
		return ! this.props.domains.hasLoadedFromServer || ! this.props.nameservers.hasLoadedFromServer;
	}

	render() {
		const classes = classNames( 'name-servers', {
			'is-placeholder': this.isLoading(),
		} );

		return (
			<Main className={ classes }>
				{ this.header() }

				<VerticalNav>
					{ this.wpcomNameserversToggle() }
					{ this.customNameservers() }
					{ this.dnsRecordsNavItem() }
				</VerticalNav>

				<VerticalNav>
					{ this.hasWpcomNameservers() && (
						<DnsTemplates selectedDomainName={ this.props.selectedDomainName } />
					) }
				</VerticalNav>
			</Main>
		);
	}

	wpcomNameserversToggle() {
		return (
			<WpcomNameserversToggle
				selectedDomainName={ this.props.selectedDomainName }
				onToggle={ this.handleToggle }
				enabled={ this.hasWpcomNameservers() }
			/>
		);
	}

	handleToggle = () => {
		if ( this.hasWpcomNameservers() ) {
			this.setState( { nameservers: [] } );
		} else {
			this.resetToWpcomNameservers();
		}
	};

	resetToWpcomNameservers = () => {
		if ( isEmpty( this.state.nameservers ) ) {
			this.setState( { nameservers: WPCOM_DEFAULTS } );
		} else {
			this.setState( { nameservers: WPCOM_DEFAULTS }, () => {
				this.saveNameservers();
			} );
		}
	};

	saveNameservers = () => {
		const { nameservers } = this.state;
		const { selectedDomainName, translate } = this.props;

		this.setState( { formSubmitting: true } );

		upgradesActions.updateNameservers( selectedDomainName, nameservers, error => {
			if ( error ) {
				this.props.errorNotice( error.message );
			} else {
				this.props.successNotice(
					translate( 'Yay, the name servers have been successfully updated!' ),
					{
						duration: 5000,
					}
				);
			}

			this.setState( { formSubmitting: false } );
		} );
	};

	header() {
		return (
			<Header onClick={ this.back } selectedDomainName={ this.props.selectedDomainName }>
				{ this.props.translate( 'Name Servers and DNS' ) }
			</Header>
		);
	}

	back = () => {
		page(
			paths.domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName )
		);
	};

	customNameservers() {
		if ( this.hasWpcomNameservers() ) {
			return null;
		}

		if ( this.needsVerification() ) {
			return (
				<IcannVerificationCard
					selectedDomainName={ this.props.selectedDomainName }
					selectedSiteSlug={ this.props.selectedSite.slug }
					explanationContext="name-servers"
				/>
			);
		}

		return (
			<CustomNameserversForm
				nameservers={ this.state.nameservers }
				selectedSite={ this.props.selectedSite }
				selectedDomainName={ this.props.selectedDomainName }
				onChange={ this.handleChange }
				onReset={ this.handleReset }
				onSubmit={ this.handleSubmit }
				submitDisabled={ this.state.formSubmitting }
			/>
		);
	}

	needsVerification() {
		if ( ! this.props.domains.hasLoadedFromServer ) {
			return false;
		}

		return getSelectedDomain( this.props ).isPendingIcannVerification;
	}

	handleChange = nameservers => {
		this.setState( { nameservers } );
	};

	handleReset = () => {
		this.resetToWpcomNameservers();
	};

	handleSubmit = () => {
		this.saveNameservers();
	};

	dnsRecordsNavItem() {
		if ( ! this.hasWpcomNameservers() ) {
			return null;
		}

		return (
			<VerticalNavItem
				isPlaceholder={ this.isLoading() }
				path={ paths.domainManagementDns(
					this.props.selectedSite.slug,
					this.props.selectedDomainName
				) }
			>
				{ this.props.translate( 'DNS Records' ) }
			</VerticalNavItem>
		);
	}
}

export default connect( null, {
	errorNotice,
	successNotice,
} )( localize( NameServers ) );
