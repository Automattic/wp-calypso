import { recordTracksEvent } from '@automattic/calypso-analytics';
import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { Substitution, useTranslate } from 'i18n-calypso';
import { useState, ChangeEvent, useEffect, FormEvent } from 'react';
import CardHeading from 'calypso/components/card-heading';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import type { DomainData, SiteDetails } from '@automattic/data-stores';

import './style.scss';

type PrimaryDomainSelectorProps = {
	domains: undefined | DomainData[];
	site: undefined | null | SiteDetails;
	onSetPrimaryDomain: ( domain: string, onComplete: () => void, type: string ) => void;
};

const PrimaryDomainSelector = ( {
	domains,
	site,
	onSetPrimaryDomain,
}: PrimaryDomainSelectorProps ) => {
	const [ selectedDomain, setSelectedDomain ] = useState< string >( '' );
	const [ primaryDomain, setPrimaryDomain ] = useState< string >( '' );
	const [ isSettingPrimaryDomain, setIsSettingPrimaryDomain ] = useState< boolean >( false );

	const translate = useTranslate();

	const primaryWithPlanOnly = useSelector( ( state ) =>
		currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
	);

	useEffect( () => {
		if ( domains?.length ) {
			const primary = domains.find( ( domain ) => {
				return domain.primary_domain;
			} );
			if ( primary ) {
				setPrimaryDomain( primary.domain );
				setSelectedDomain( '' );
			}
		}
	}, [ domains ] );

	if ( ! domains || ! site ) {
		return null;
	}

	const isOnFreePlan = site?.plan?.is_free ?? false;
	const canUserSetPrimaryDomainOnThisSite = ! ( primaryWithPlanOnly && isOnFreePlan );

	const shouldUpgradeToMakeDomainPrimary = ( domain: DomainData ): boolean => {
		return (
			! canUserSetPrimaryDomainOnThisSite &&
			( domain.type === 'registered' || domain.type === 'mapping' ) &&
			! domain.current_user_can_create_site_from_domain_only &&
			! domain.wpcom_domain &&
			! domain.is_wpcom_staging_domain &&
			( site?.plan?.features?.active.includes( FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ) ?? false )
		);
	};

	// All domains that can be set as primary, except the current primary domain
	let otherValidPrimaryDomains = domains.filter( ( domain ) => {
		return (
			domain.can_set_as_primary &&
			! domain.aftermarket_auction &&
			! shouldUpgradeToMakeDomainPrimary( domain ) &&
			! domain.primary_domain
		);
	} );

	const hasWpcomStagingDomain = domains.find( ( domain ) => domain.is_wpcom_staging_domain );

	if ( hasWpcomStagingDomain ) {
		otherValidPrimaryDomains = otherValidPrimaryDomains.filter( ( domain ) => {
			if ( domain.wpcom_domain ) {
				return domain.is_wpcom_staging_domain;
			}

			return true;
		} );
	}

	const onSelectChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		setSelectedDomain( event.target.value );
	};

	const onSubmit = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		const domain = domains.find( ( d ) => d.domain === selectedDomain );
		if ( ! domain || ! selectedDomain ) {
			return;
		}

		setIsSettingPrimaryDomain( true );
		onSetPrimaryDomain(
			selectedDomain,
			() => {
				setIsSettingPrimaryDomain( false );
				setSelectedDomain( '' );
			},
			domain.type
		);
	};

	const trackUpgradeClick = ( isPlanUpgrade: boolean = false ) => {
		recordTracksEvent( 'calypso_primary_site_address_nudge_cta_click', {
			cta_name: isPlanUpgrade ? 'buy_a_plan' : 'add_custom_domain',
		} );
	};

	let message: Substitution;

	if ( ! canUserSetPrimaryDomainOnThisSite ) {
		// The user can't set a primary domain on this site because they need to upgrade their plan
		message = translate(
			"Your site plan doesn't allow to set a custom domain as a primary site address. {{planUpgradeLink}}Upgrade your plan{{/planUpgradeLink}} and get a free one-year domain registration or transfer with any annual paid plan. {{learnMoreLink}}Learn more{{/learnMoreLink}}.",
			{
				components: {
					planUpgradeLink: (
						<a href={ '/plans/' + primaryDomain } onClick={ () => trackUpgradeClick( true ) } />
					),
					learnMoreLink: (
						<InlineSupportLink supportContext="primary-site-address" showIcon={ false } />
					),
				},
			}
		);
	} else if ( otherValidPrimaryDomains.length < 1 ) {
		// The user can't set a primary domain because they don't have any other valid domains
		message = translate(
			'Before changing your primary site address you must {{domainSearchLink}}register{{/domainSearchLink}} or {{mapDomainLink}}connect{{/mapDomainLink}} a new custom domain. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				components: {
					domainSearchLink: (
						<a
							href={ '/domains/add/' + primaryDomain }
							onClick={ () => trackUpgradeClick( false ) }
						/>
					),
					mapDomainLink: (
						<a
							href={ '/domains/add/use-my-domain/' + primaryDomain }
							onClick={ () => trackUpgradeClick( false ) }
						/>
					),
					learnMoreLink: (
						<InlineSupportLink supportContext="primary-site-address" showIcon={ false } />
					),
				},
			}
		);
	} else {
		// The user has at least one domain that can be set as primary and the site is on a plan that allows it
		message = translate(
			'The current primary address set for this site is: {{strong}}%(selectedDomain)s{{/strong}}. You can change it by selecting a different address from the list below. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				args: { selectedDomain: primaryDomain as string },
				components: {
					strong: <strong />,
					learnMoreLink: (
						<InlineSupportLink supportContext="primary-site-address" showIcon={ false } />
					),
				},
			}
		);
	}

	return (
		<Card className="domains-set-primary-address">
			<CardHeading className="domains-set-primary-address__title" isBold size={ 16 } tagName="h2">
				{ translate( 'Primary site address' ) }
			</CardHeading>
			<>
				<p className="domains-set-primary-address__subtitle">{ message }</p>
				{ otherValidPrimaryDomains.length > 0 && canUserSetPrimaryDomainOnThisSite && (
					<FormFieldset className="domains-set-primary-address__fieldset">
						<FormSelect
							className="domains-set-primary-address__select"
							disabled={ isSettingPrimaryDomain }
							id="primary-domain-selector"
							onChange={ onSelectChange }
							value={ selectedDomain }
						>
							<option value="">{ translate( 'Select a domain' ) }</option>
							{ otherValidPrimaryDomains.map( ( domain ) => (
								<option key={ domain.domain } value={ domain.domain }>
									{ domain.domain }
								</option>
							) ) }
						</FormSelect>
						<FormButton
							className="domains-set-primary-address__submit"
							primary
							busy={ isSettingPrimaryDomain }
							disabled={ isSettingPrimaryDomain || ! selectedDomain }
							onClick={ onSubmit }
						>
							{ translate( 'Set as primary' ) }
						</FormButton>
					</FormFieldset>
				) }
			</>
		</Card>
	);
};

export default PrimaryDomainSelector;
