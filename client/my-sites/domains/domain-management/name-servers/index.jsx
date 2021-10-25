import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { getSelectedDomain } from 'calypso/lib/domains';
import { CHANGE_NAME_SERVERS } from 'calypso/lib/url/support';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import NonPrimaryDomainPlanUpsell from 'calypso/my-sites/domains/domain-management/components/domain/non-primary-domain-plan-upsell';
import IcannVerificationCard from 'calypso/my-sites/domains/domain-management/components/icann-verification';
import { domainManagementEdit, domainManagementDns } from 'calypso/my-sites/domains/paths';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	WPCOM_DEFAULT_NAMESERVERS,
	WPCOM_DEFAULT_NAMESERVERS_REGEX,
	CLOUDFLARE_NAMESERVERS_REGEX,
} from './constants';
import CustomNameserversForm from './custom-nameservers-form';
import DnsTemplates from './dns-templates';
import FetchError from './fetch-error';
import withDomainNameservers from './with-domain-nameservers';
import WpcomNameserversToggle from './wpcom-nameservers-toggle';

import './style.scss';

class NameServers extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		isRequestingSiteDomains: PropTypes.bool.isRequired,
		nameservers: PropTypes.array,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	state = {
		nameservers: this.props.nameservers ?? null,
	};

	UNSAFE_componentWillReceiveProps( props ) {
		this.setStateWhenLoadedFromServer( props );
	}

	hasWpcomNameservers = () => {
		if ( ! this.props.nameservers ) {
			return true;
		}

		if ( this.state.nameservers.length === 0 ) {
			return false;
		}

		return this.state.nameservers.every( ( nameserver ) => {
			return ! nameserver || WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
		} );
	};

	hasCloudflareNameservers = () => {
		if ( this.state.nameservers.length === 0 ) {
			return false;
		}

		return this.state.nameservers.every( ( nameserver ) => {
			return ! nameserver || CLOUDFLARE_NAMESERVERS_REGEX.test( nameserver );
		} );
	};

	setStateWhenLoadedFromServer( nextProps ) {
		const finishedLoading = this.props.isLoadingNameservers && ! nextProps.isLoadingNameservers;

		if ( ! finishedLoading ) {
			return;
		}

		this.setState( { nameservers: nextProps.nameservers } );
	}

	isLoading() {
		return this.props.isRequestingSiteDomains || this.props.isLoadingNameservers;
	}

	isPendingTransfer() {
		const domain = getSelectedDomain( this.props );

		return get( domain, 'pendingTransfer', false );
	}

	warning() {
		const { translate } = this.props;
		if (
			this.hasWpcomNameservers() ||
			this.hasCloudflareNameservers() ||
			this.isPendingTransfer() ||
			this.needsVerification() ||
			! this.state.nameservers ||
			! this.state.nameservers.length
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
		if ( this.props.loadingNameserversError ) {
			return <FetchError selectedDomainName={ this.props.selectedDomainName } />;
		}

		const domain = getSelectedDomain( this.props );

		return (
			<Fragment>
				<DomainWarnings
					domain={ domain }
					position="domain-name-servers"
					selectedSite={ this.props.selectedSite }
					allowedRules={ [ 'pendingTransfer' ] }
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
			</Fragment>
		);
	}

	render() {
		const classes = classNames( 'name-servers', {
			'is-placeholder': this.isLoading(),
		} );

		return (
			<Main className={ classes }>
				{ this.renderBreadcrumbs() }
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
			this.setState( { nameservers: WPCOM_DEFAULT_NAMESERVERS } );
		} else {
			this.setState( { nameservers: WPCOM_DEFAULT_NAMESERVERS }, () => {
				this.saveNameservers();
			} );
		}
	};

	renderBreadcrumbs() {
		const { translate, selectedSite, currentRoute, selectedDomainName } = this.props;
		const previousPath = domainManagementEdit(
			selectedSite.slug,
			selectedDomainName,
			currentRoute
		);

		const items = [
			{
				label: translate( 'Domains' ),
				helpBubble: translate(
					'Manage the domains connected to your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
						},
					}
				),
			},
			{
				label: selectedDomainName,
				href: previousPath,
			},
			{ label: translate( 'DNS records' ) },
		];

		const mobileItem = {
			label: translate( 'Back' ),
			href: previousPath,
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	}

	saveNameservers = () => {
		const { nameservers } = this.state;

		this.props.updateNameservers( nameservers );
	};

	back = () => {
		page(
			domainManagementEdit(
				this.props.selectedSite.slug,
				this.props.selectedDomainName,
				this.props.currentRoute
			)
		);
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
				submitDisabled={ this.isLoading() }
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
				path={ domainManagementDns(
					this.props.selectedSite.slug,
					this.props.selectedDomainName,
					this.props.currentRoute
				) }
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

export default connect( ( state ) => ( { currentRoute: getCurrentRoute( state ) } ), {
	customNameServersLearnMoreClick,
} )( localize( withDomainNameservers( NameServers ) ) );
