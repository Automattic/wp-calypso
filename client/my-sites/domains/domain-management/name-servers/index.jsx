/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Header from 'my-sites/domains/domain-management/components/header';
import CustomNameserversForm from './custom-nameservers-form';
import WpcomNameserversToggle from './wpcom-nameservers-toggle';
import IcannVerificationCard from 'my-sites/domains/domain-management/components/icann-verification';
import DnsTemplates from './dns-templates';
import { domainManagementEdit, domainManagementDns } from 'my-sites/domains/paths';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { updateNameservers } from 'lib/domains/nameservers/actions';
import { WPCOM_DEFAULTS, isWpcomDefaults } from 'lib/domains/nameservers';
import { getSelectedDomain } from 'lib/domains';
import { errorNotice, successNotice } from 'state/notices/actions';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import FetchError from './fetch-error';
import Notice from 'components/notice';
import { CHANGE_NAME_SERVERS } from 'lib/url/support';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';
import NonPrimaryDomainPlanUpsell from 'my-sites/domains/domain-management/components/domain/non-primary-domain-plan-upsell';

class NameServers extends React.Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		isRequestingSiteDomains: PropTypes.bool.isRequired,
		nameservers: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	state = {
		formSubmitting: false,
		nameservers: this.props.nameservers.hasLoadedFromServer ? this.props.nameservers.list : null,
	};

	UNSAFE_componentWillReceiveProps( props ) {
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
		return this.props.isRequestingSiteDomains || this.props.nameservers.isFetching;
	}

	isPendingTransfer() {
		const domain = getSelectedDomain( this.props );

		return get( domain, 'pendingTransfer', false );
	}

	warning() {
		const { translate } = this.props;

		if (
			this.hasWpcomNameservers() ||
			this.isPendingTransfer() ||
			this.needsVerification() ||
			! this.state.nameservers
		) {
			return null;
		}

		return (
			<Notice status="is-warning" showDismiss={ false }>
				{ translate(
					'Your domain must use WordPress.com name servers for your ' +
						'WordPress.com site to load & other features to be available.'
				) }{ ' ' }
				<a
					href={ CHANGE_NAME_SERVERS }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ this.handleLearnMoreClick }
				>
					{ translate( 'Learn more.' ) }
				</a>
			</Notice>
		);
	}

	handleLearnMoreClick = () => {
		this.props.customNameServersLearnMoreClick( this.props.selectedDomainName );
	};

	getContent() {
		if ( this.props.nameservers.error ) {
			return <FetchError selectedDomainName={ this.props.selectedDomainName } />;
		}

		const domain = getSelectedDomain( this.props );

		return (
			<React.Fragment>
				<DomainWarnings
					domain={ domain }
					position="domain-name-servers"
					selectedSite={ this.props.selectedSite }
					ruleWhiteList={ [ 'pendingTransfer' ] }
				/>
				{ this.warning() }
				{ this.planUpsellForNonPrimaryDomain( domain ) }
				<VerticalNav>
					{ this.wpcomNameserversToggle() }
					{ this.customNameservers() }
					{ this.dnsRecordsNavItem() }
				</VerticalNav>

				<VerticalNav>
					{ this.hasWpcomNameservers() && ! this.isPendingTransfer() && (
						<DnsTemplates selectedDomainName={ this.props.selectedDomainName } />
					) }
				</VerticalNav>
			</React.Fragment>
		);
	}

	render() {
		const classes = classNames( 'name-servers', {
			'is-placeholder': this.isLoading(),
		} );

		return (
			<Main className={ classes }>
				{ this.header() }
				{ this.getContent() }
			</Main>
		);
	}

	wpcomNameserversToggle() {
		if ( this.isPendingTransfer() ) {
			return null;
		}

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

		updateNameservers( selectedDomainName, nameservers, ( error ) => {
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
		page( domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};

	customNameservers() {
		if ( this.hasWpcomNameservers() || this.isPendingTransfer() ) {
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

	planUpsellForNonPrimaryDomain( domain ) {
		return (
			<NonPrimaryDomainPlanUpsell
				tracksImpressionName="calypso_non_primary_domain_ns_plan_upsell_impression"
				tracksClickName="calypso_non_primary_domain_ns_plan_upsell_click"
				domain={ domain }
			/>
		);
	}

	needsVerification() {
		if ( this.props.isRequestingSiteDomains ) {
			return false;
		}

		return getSelectedDomain( this.props ).isPendingIcannVerification;
	}

	handleChange = ( nameservers ) => {
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
				path={ domainManagementDns( this.props.selectedSite.slug, this.props.selectedDomainName ) }
			>
				{ this.props.translate( 'DNS records' ) }
			</VerticalNavItem>
		);
	}
}

const customNameServersLearnMoreClick = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Learn More" link in "Custom Name Servers" Form in Name Servers and DNS',
			'Domain Name',
			domainName
		),
		recordTracksEvent(
			'calypso_domain_management_name_servers_custom_name_servers_learn_more_click',
			{ domain_name: domainName }
		)
	);

export default connect( null, {
	customNameServersLearnMoreClick,
	errorNotice,
	successNotice,
} )( localize( NameServers ) );
