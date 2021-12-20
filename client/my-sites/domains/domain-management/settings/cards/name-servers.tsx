import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import { CHANGE_NAME_SERVERS } from 'calypso/lib/url/support';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import NonPrimaryDomainPlanUpsell from 'calypso/my-sites/domains/domain-management/components/domain/non-primary-domain-plan-upsell';
import IcannVerificationCard from 'calypso/my-sites/domains/domain-management/components/icann-verification';
import {
	WPCOM_DEFAULT_NAMESERVERS,
	WPCOM_DEFAULT_NAMESERVERS_REGEX,
	CLOUDFLARE_NAMESERVERS_REGEX,
} from 'calypso/my-sites/domains/domain-management/name-servers/constants';
import CustomNameserversForm from 'calypso/my-sites/domains/domain-management/name-servers/custom-nameservers-form';
import FetchError from 'calypso/my-sites/domains/domain-management/name-servers/fetch-error';
import withDomainNameservers from 'calypso/my-sites/domains/domain-management/name-servers/with-domain-nameservers';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import NameServersToggle from './name-servers-toggle';

import './style.scss';

const NameServers = ( props ) => {
	const translate = useTranslate();
	const [ nameservers, setNameservers ] = useState( props.nameservers || null );

	useEffect( () => {
		if ( props.isLoadingNameservers === false ) {
			setNameservers( props.nameservers );
		}
	}, [ props.isLoadingNameservers ] );

	// static propTypes = {
	// 	domains: PropTypes.array.isRequired,
	// 	isRequestingSiteDomains: PropTypes.bool.isRequired,
	// 	nameservers: PropTypes.array,
	// 	selectedDomainName: PropTypes.string.isRequired,
	// 	selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	// };

	const hasWpcomNameservers = () => {
		if ( ! props.nameservers ) {
			return true;
		}

		if ( ! nameservers || nameservers.length === 0 ) {
			return false;
		}

		return nameservers.every( ( nameserver ) => {
			return ! nameserver || WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
		} );
	};

	const hasCloudflareNameservers = () => {
		if ( ! nameservers || nameservers.length === 0 ) {
			return false;
		}

		return nameservers.every( ( nameserver ) => {
			return ! nameserver || CLOUDFLARE_NAMESERVERS_REGEX.test( nameserver );
		} );
	};

	const isLoading = () => {
		return props.isRequestingSiteDomains || props.isLoadingNameservers;
	};

	const isPendingTransfer = () => {
		return props.domain.pendingTransfer || false;
	};

	const warning = () => {
		if (
			hasWpcomNameservers() ||
			hasCloudflareNameservers() ||
			isPendingTransfer() ||
			needsVerification() ||
			! nameservers ||
			! nameservers.length
		) {
			return null;
		}

		return (
			<Notice status="is-warning" showDismiss={ false }>
				{ translate(
					'By using custom name servers, you will manage your DNS records with your new provider, not WordPress.com.'
				) }{ ' ' }
				<a
					href={ CHANGE_NAME_SERVERS }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ handleLearnMoreClick }
				>
					{ translate( 'Learn more.' ) }
				</a>
			</Notice>
		);
	};

	const handleLearnMoreClick = () => {
		props.customNameServersLearnMoreClick( props.selectedDomainName );
	};

	const renderWpcomNameserversToggle = () => {
		if ( isPendingTransfer() ) {
			return null;
		}

		return (
			<NameServersToggle
				selectedDomainName={ props.selectedDomainName }
				onToggle={ handleToggle }
				enabled={ hasWpcomNameservers() }
			/>
		);
	};

	const handleToggle = () => {
		if ( hasWpcomNameservers() ) {
			setNameservers( [] );
		} else {
			resetToWpcomNameservers();
		}
	};

	const resetToWpcomNameservers = () => {
		if ( ! nameservers || nameservers.length === 0 ) {
			setNameservers( WPCOM_DEFAULT_NAMESERVERS );
		} else {
			setNameservers( WPCOM_DEFAULT_NAMESERVERS );
			saveNameservers();
		}
	};

	const saveNameservers = () => {
		props.updateNameservers( nameservers );
	};

	const renderCustomNameservers = () => {
		if ( hasWpcomNameservers() || isPendingTransfer() ) {
			return null;
		}

		// TODO: Check how this one appears
		if ( needsVerification() ) {
			return (
				<IcannVerificationCard
					selectedDomainName={ props.selectedDomainName }
					selectedSiteSlug={ props.selectedSite.slug }
					explanationContext="name-servers"
				/>
			);
		}

		return (
			<CustomNameserversForm
				nameservers={ nameservers }
				selectedSite={ props.selectedSite }
				selectedDomainName={ props.selectedDomainName }
				onChange={ handleChange }
				onReset={ handleReset }
				onSubmit={ handleSubmit }
				submitDisabled={ isLoading() }
				notice={ warning() }
				redesign
			/>
		);
	};

	const renderPlanUpsellForNonPrimaryDomain = ( domain ) => {
		return (
			<NonPrimaryDomainPlanUpsell
				tracksImpressionName="calypso_non_primary_domain_ns_plan_upsell_impression"
				tracksClickName="calypso_non_primary_domain_ns_plan_upsell_click"
				domain={ domain }
			/>
		);
	};

	const needsVerification = () => {
		if ( props.isRequestingSiteDomains ) {
			return false;
		}

		return props.domain.isPendingIcannVerification;
	};

	const handleChange = ( nameservers ) => {
		setNameservers( nameservers );
	};

	const handleReset = () => {
		resetToWpcomNameservers();
	};

	const handleSubmit = () => {
		saveNameservers();
	};

	// render()
	if ( props.loadingNameserversError ) {
		return <FetchError selectedDomainName={ props.selectedDomainName } />;
	}

	if ( isLoading() ) {
		return <>LOADING</>;
	}

	return (
		<div className="name-servers-card">
			<DomainWarnings
				domain={ props.domain }
				position="domain-name-servers"
				selectedSite={ props.selectedSite }
				allowedRules={ [ 'pendingTransfer' ] }
			/>
			{ renderPlanUpsellForNonPrimaryDomain( props.domain ) }
			{ renderWpcomNameserversToggle() }
			{ renderCustomNameservers() }
		</div>
	);
	// /render
};

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
} )( withDomainNameservers( NameServers ) );
