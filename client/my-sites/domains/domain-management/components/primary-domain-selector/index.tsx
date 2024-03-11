import { useState, ChangeEvent } from 'react';
import FormSelect from 'calypso/components/forms/form-select';
import type { DomainData } from '@automattic/data-stores';

// import './style.scss';

type PrimaryDomainSelectorProps = {
	domains: undefined | DomainData[];
};

const PrimaryDomainSelector = ( { domains }: PrimaryDomainSelectorProps ) => {
	const [ selectedDomain, setSelectedDomain ] = useState< undefined | string >( undefined );

	if ( ! domains ) {
		return null;
	}

	const validPrimaryDomains = domains.filter( ( domain ) => {
		return domain.can_set_as_primary;
	} );

	// const primaryDomain = validPrimaryDomains.find( ( domain ) => {
	// 	return domain.primary_domain;
	// } );

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
