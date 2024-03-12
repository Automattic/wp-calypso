import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { useState, ChangeEvent, useEffect } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import type { DomainData, SiteDetails } from '@automattic/data-stores';

// import './style.scss';

type PrimaryDomainSelectorProps = {
	domains: undefined | DomainData[];
	userCanSetPrimaryDomains: boolean;
	site: undefined | null | SiteDetails;
};

const PrimaryDomainSelector = ( {
	domains,
	site,
	userCanSetPrimaryDomains,
}: PrimaryDomainSelectorProps ) => {
	const [ selectedDomain, setSelectedDomain ] = useState< undefined | string >( undefined );

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

	const validPrimaryDomains = domains.filter( ( domain ) => {
		return (
			domain.can_set_as_primary &&
			! domain.aftermarket_auction &&
			! (
				( ! userCanSetPrimaryDomains && site?.plan?.is_free ) ??
				( true &&
					( domain.type === 'registered' || domain.type === 'mapping' ) &&
					! domain.current_user_can_create_site_from_domain_only &&
					! domain.wpcom_domain &&
					! domain.is_wpcom_staging_domain &&
					( site?.plan?.features.active.includes( FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ) ?? false ) )
			) &&
			domain.points_to_wpcom
		);
	} );

	const changeType = ( event: ChangeEvent< HTMLSelectElement > ) => {
		setSelectedDomain( event.target.value );
	};

	return (
		<div>
			PRIMARY DOMAIN DROPDOWN
			<FormSelect onChange={ changeType } value={ selectedDomain }>
				{ validPrimaryDomains.map( ( domain ) => (
					<option key={ domain.domain }>{ domain.domain }</option>
				) ) }
			</FormSelect>
		</div>
	);
};

export default PrimaryDomainSelector;
