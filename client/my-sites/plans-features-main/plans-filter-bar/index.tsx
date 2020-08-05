/**
 * External dependencies
 */

import React, { useState } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import SelectDropdown from 'components/select-dropdown';
import { TERM_MONTHLY, TERM_ANNUALLY } from 'lib/plans/constants';

/**
 * Style dependencies
 */
import './style.scss';

type ProductTypeFilter = ALL | PERFORMANCE | SECURITY;
type DurationTypeFilter = TERM_MONTHLY | TERM_ANNUALLY;

const ALL = 'all';
const PERFORMANCE = 'performance';
const SECURITY = 'security';

const productTypeOptions = {
	[ ALL ]: {
		id: ALL,
		label: translate( 'All' ),
	},
	[ SECURITY ]: {
		id: SECURITY,
		label: translate( 'Security' ),
	},
	[ PERFORMANCE ]: {
		id: PERFORMANCE,
		label: translate( 'Performance' ),
	},
};

const PlansFilterBar = () => {
	// TODO: since the duration or duration will be store in the URL, we need to
	// replace this internal state and use the path to get it and set it
	const [ duration, setDuration ] = useState< DurationTypeFilter >( TERM_ANNUALLY );
	const [ productType, setProductType ] = useState< ProductTypeFilter >( SECURITY );
	return (
		<div className="plans-filter-bar">
			<SelectDropdown selectedText={ productTypeOptions[ productType ].label }>
				{ Object.values( productTypeOptions ).map( ( option ) => (
					<SelectDropdown.Item
						key={ option.id }
						selected={ productType === option.id }
						onClick={ () => setProductType( option.id ) }
					>
						{ option.label }
					</SelectDropdown.Item>
				) ) }
			</SelectDropdown>
			<SegmentedControl primary={ true }>
				<SegmentedControl.Item
					onClick={ () => setDuration( TERM_MONTHLY ) }
					selected={ duration === TERM_MONTHLY }
				>
					{ translate( 'Monthly' ) }
				</SegmentedControl.Item>

				<SegmentedControl.Item
					onClick={ () => setDuration( TERM_ANNUALLY ) }
					selected={ duration === TERM_ANNUALLY }
				>
					{ translate( 'Yearly' ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};

export default PlansFilterBar;
