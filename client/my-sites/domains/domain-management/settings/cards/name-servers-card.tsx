import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { CHANGE_NAME_SERVERS } from '@automattic/urls';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import NonPrimaryDomainPlanUpsell from 'calypso/my-sites/domains/domain-management/components/domain/non-primary-domain-plan-upsell';
import IcannVerificationCard from 'calypso/my-sites/domains/domain-management/components/icann-verification';
import {
	WPCOM_DEFAULT_NAMESERVERS,
	WPCOM_DEFAULT_NAMESERVERS_REGEX,
} from 'calypso/my-sites/domains/domain-management/name-servers/constants';
import CustomNameserversForm from 'calypso/my-sites/domains/domain-management/name-servers/custom-nameservers-form';
import FetchError from 'calypso/my-sites/domains/domain-management/name-servers/fetch-error';
import { useDispatch } from 'calypso/state';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import NameServersToggle from './name-servers-toggle';
import type { NameServersCardProps } from './types';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

const customNameServersLearnMoreClick = ( domainName: string ) =>
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

const NameServersCard = ( {
	domain,
	isLoadingNameservers,
	isRequestingSiteDomains,
	loadingNameserversError,
	nameservers: nameserversProps,
	selectedDomainName,
	selectedSite,
	updateNameservers,
}: NameServersCardProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ nameservers, setNameservers ] = useState( nameserversProps || null );
	const [ shouldPersistNameServers, setShouldPersistNameServers ] = useState( false );
	const [ isEditingNameServers, setIsEditingNameServers ] = useState( false );
	const [ nameServersBeforeEditing, setNameServersBeforeEditing ] = useState< string[] | null >(
		null
	);

	useEffect( () => {
		setNameservers( nameserversProps );
	}, [ nameserversProps ] );

	useEffect( () => {
		if ( shouldPersistNameServers ) {
			updateNameservers( nameservers || [] );
			setShouldPersistNameServers( false );
		}
	}, [ shouldPersistNameServers, nameservers ] );

	const hasWpcomNameservers = () => {
		if ( ! nameservers || nameservers.length === 0 ) {
			return false;
		}

		return nameservers.some( ( nameserver ) => {
			return WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
		} );
	};

	const onlyWpcomNameservers = () => {
		if ( ! nameservers || nameservers.length === 0 ) {
			return false;
		}

		return (
			nameservers.every( ( nameserver ) => {
				return WPCOM_DEFAULT_NAMESERVERS_REGEX.test( nameserver );
			} ) && nameservers.length === WPCOM_DEFAULT_NAMESERVERS.length
		);
	};

	const isPendingTransfer = () => {
		return domain.pendingTransfer || false;
	};

	const needsVerification = () => {
		if ( isRequestingSiteDomains ) {
			return false;
		}

		return domain.isPendingIcannVerification;
	};

	const handleLearnMoreClick = () => {
		dispatch( customNameServersLearnMoreClick( selectedDomainName ) );
	};

	const warning = () => {
		if (
			! isEditingNameServers ||
			isPendingTransfer() ||
			needsVerification() ||
			! nameservers ||
			! nameservers.length
		) {
			return null;
		}

		const link = (
			<a
				href={ localizeUrl( CHANGE_NAME_SERVERS ) }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ handleLearnMoreClick }
			/>
		);

		let notice;
		if ( isEditingNameServers && hasWpcomNameservers() ) {
			notice = translate(
				'Please do not set WordPress.com nameservers manually, toggle that on with the switch above. {{link}}Learn more{{/link}}',
				{ components: { link } }
			);
		} else {
			notice = translate(
				'By using custom name servers, you will manage your DNS records with your new provider, not WordPress.com. {{link}}Learn more{{/link}}',
				{ components: { link } }
			);
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		if ( notice ) {
			return (
				<div className="custom-name-servers-notice">
					<Icon
						icon={ info }
						size={ 18 }
						className="custom-name-servers-notice__icon gridicon"
						viewBox="2 2 20 20"
					/>
					<div className="custom-name-servers-notice__message">{ notice }</div>
				</div>
			);
		}
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	};

	const resetToWpcomNameservers = () => {
		setNameservers( WPCOM_DEFAULT_NAMESERVERS );
		setShouldPersistNameServers( true );
		setIsEditingNameServers( false );
	};

	const handleToggle = () => {
		setIsEditingNameServers( ! isEditingNameServers );
		if ( onlyWpcomNameservers() ) {
			setNameServersBeforeEditing( nameservers );
			setNameservers( [] );
			setIsEditingNameServers( true );
		} else {
			resetToWpcomNameservers();
		}
	};

	const renderWpcomNameserversToggle = () => {
		if ( isPendingTransfer() ) {
			return null;
		}

		return (
			<NameServersToggle
				selectedDomainName={ selectedDomainName }
				onToggle={ handleToggle }
				enabled={ onlyWpcomNameservers() && ! isEditingNameServers }
			/>
		);
	};

	const isLoading = () => {
		return isRequestingSiteDomains || isLoadingNameservers;
	};

	const handleChange = ( nameservers: string[] ) => {
		setNameservers( nameservers );
	};

	const handleReset = () => {
		resetToWpcomNameservers();
	};

	const handleSubmit = () => {
		updateNameservers( nameservers || [] );
		setIsEditingNameServers( false );
	};

	const editCustomNameServers = () => {
		setIsEditingNameServers( true );
		setNameServersBeforeEditing( nameservers );
	};

	const handleCancel = () => {
		setIsEditingNameServers( false );
		setNameservers( nameServersBeforeEditing || [] );
	};

	const renderCustomNameserversForm = () => {
		if (
			! nameservers ||
			isPendingTransfer() ||
			( onlyWpcomNameservers() && ! isEditingNameServers )
		) {
			return null;
		}

		if ( needsVerification() ) {
			return (
				<IcannVerificationCard
					selectedDomainName={ selectedDomainName }
					selectedSiteSlug={ selectedSite.slug }
					explanationContext="name-servers"
				/>
			);
		}

		if ( isEditingNameServers ) {
			return (
				<CustomNameserversForm
					nameservers={ nameservers }
					selectedSite={ selectedSite }
					selectedDomainName={ selectedDomainName }
					onChange={ handleChange }
					onCancel={ handleCancel }
					onReset={ handleReset }
					onSubmit={ handleSubmit }
					submitDisabled={ isLoading() || !! hasWpcomNameservers() }
					notice={ warning() }
					redesign
				/>
			);
		}

		return (
			<div className="name-servers-card__name-server-list">
				{ nameservers.map( ( nameserver ) => (
					<p key={ nameserver }>{ nameserver }</p>
				) ) }
				<Button onClick={ editCustomNameServers }>
					{ translate( 'Edit custom name servers' ) }
				</Button>
			</div>
		);
	};

	const renderPlanUpsellForNonPrimaryDomain = ( domain: ResponseDomain ) => {
		return (
			<NonPrimaryDomainPlanUpsell
				tracksImpressionName="calypso_non_primary_domain_ns_plan_upsell_impression"
				tracksClickName="calypso_non_primary_domain_ns_plan_upsell_click"
				domain={ domain }
			/>
		);
	};

	if ( isLoading() ) {
		return <p className="name-servers-card__loading" />;
	}

	if ( loadingNameserversError ) {
		return <FetchError selectedDomainName={ selectedDomainName } />;
	}

	return (
		<div className="name-servers-card">
			<DomainWarnings
				domain={ domain }
				position="domain-name-servers"
				selectedSite={ selectedSite }
				allowedRules={ [ 'pendingTransfer' ] }
			/>
			{ renderPlanUpsellForNonPrimaryDomain( domain ) }
			{ renderWpcomNameserversToggle() }
			{ renderCustomNameserversForm() }
		</div>
	);
};

export default NameServersCard;
