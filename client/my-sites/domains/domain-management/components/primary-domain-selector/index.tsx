import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState, ChangeEvent, useEffect } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';
import type { DomainData, SiteDetails } from '@automattic/data-stores';

import './style.scss';

type PrimaryDomainSelectorProps = {
	domains: undefined | DomainData[];
	userCanSetPrimaryDomains: boolean;
	site: undefined | null | SiteDetails;
	onSetPrimaryDomain: ( domain: string, onComplete: () => void, type: string ) => void;
};

const PrimaryDomainSelector = ( {
	domains,
	site,
	userCanSetPrimaryDomains,
	onSetPrimaryDomain,
}: PrimaryDomainSelectorProps ) => {
	const [ selectedDomain, setSelectedDomain ] = useState< undefined | string >( undefined );
	const [ isSettingPrimaryDomain, setIsSettingPrimaryDomain ] = useState< boolean >( false );

	const translate = useTranslate();

	useEffect( () => {
		if ( domains?.length ) {
			const primaryDomain = domains.find( ( domain ) => {
				return domain.primary_domain;
			} );
			if ( primaryDomain ) {
				setSelectedDomain( primaryDomain.domain );
			}
		}
	}, [ domains ] );

	if ( ! domains || ! site ) {
		return null;
	}

	const isOnFreePlan = site?.plan?.is_free ?? false;

	const shouldUpgradeToMakeDomainPrimary = ( domain: DomainData ): boolean => {
		return (
			! userCanSetPrimaryDomains &&
			isOnFreePlan &&
			( domain.type === 'registered' || domain.type === 'mapping' ) &&
			! domain.current_user_can_create_site_from_domain_only &&
			! domain.wpcom_domain &&
			! domain.is_wpcom_staging_domain &&
			( site?.plan?.features.active.includes( FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ) ?? false )
		);
	};

	let validPrimaryDomains = domains.filter( ( domain ) => {
		return (
			domain.can_set_as_primary &&
			! domain.aftermarket_auction &&
			domain.points_to_wpcom &&
			! shouldUpgradeToMakeDomainPrimary( domain )
		);
	} );

	const hasWpcomStagingDomain = validPrimaryDomains.find(
		( domain ) => domain.is_wpcom_staging_domain
	);

	if ( hasWpcomStagingDomain ) {
		validPrimaryDomains = validPrimaryDomains.filter( ( domain ) => {
			if ( domain.wpcom_domain ) {
				return domain.is_wpcom_staging_domain;
			}

			return true;
		} );
	}

	const onSelectChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		setSelectedDomain( event.target.value );

		const domain = domains.find( ( d ) => d.domain === event.target.value );
		if ( ! domain ) {
			return;
		}

		setIsSettingPrimaryDomain( true );
		onSetPrimaryDomain( event.target.value, () => setIsSettingPrimaryDomain( false ), domain.type );
	};

	const supportLink = localizeUrl( 'https://wordpress.com/support/domains/set-a-primary-address/' );

	return (
		<FormFieldset className="domains-set-primary-address">
			<FormLabel htmlFor="primary-domain-selector" className="domains-set-primary-address__title">
				{ translate( 'Primary site address' ) }
			</FormLabel>
			<div>
				<FormSettingExplanation className="domains-set-primary-address__subtitle">
					{ translate(
						'The current primary address set for this site is: {{strong}}%(selectedDomain)s{{/strong}}. You can change it by selecting a different address from the list below. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							args: { selectedDomain: selectedDomain as string },
							components: {
								strong: <strong />,
								learnMoreLink: <InlineSupportLink supportLink={ supportLink } showIcon={ false } />,
							},
						}
					) }
				</FormSettingExplanation>
				<FormSelect
					disabled={ isSettingPrimaryDomain }
					id="primary-domain-selector"
					onChange={ onSelectChange }
					value={ selectedDomain }
				>
					{ validPrimaryDomains.map( ( domain ) => (
						<option key={ domain.domain } value={ domain.domain }>
							{ domain.domain }
						</option>
					) ) }
				</FormSelect>
			</div>
		</FormFieldset>
	);
};

export default PrimaryDomainSelector;
