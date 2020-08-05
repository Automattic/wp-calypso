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
import type { Duration, ProductType } from '../types';
import { ALL, PERFORMANCE, SECURITY } from '../constants';

/**
 * Style dependencies
 */
import './style.scss';

const productTypeOptions = {
	[ SECURITY ]: {
		id: SECURITY,
		label: translate( 'Security' ),
	},
	[ PERFORMANCE ]: {
		id: PERFORMANCE,
		label: translate( 'Performance' ),
	},
	[ ALL ]: {
		id: ALL,
		label: translate( 'All' ),
	},
};

interface Props {
	duration: Duration;
	productType: ProductType;
	onDurationChange: Function;
	onProductTypeChange: Function;
}

const PlansFilterBar = ( {
	duration,
	productType,
	onDurationChange,
	onProductTypeChange,
}: Props ) => {
	return (
		<div className="plans-filter-bar">
			<SelectDropdown selectedText={ productTypeOptions[ productType ].label }>
				{ Object.values( productTypeOptions ).map( ( option ) => (
					<SelectDropdown.Item
						key={ option.id }
						selected={ productType === option.id }
						onClick={ () => onProductTypeChange( option.id ) }
					>
						{ option.label }
					</SelectDropdown.Item>
				) ) }
			</SelectDropdown>
			<SegmentedControl primary={ true }>
				<SegmentedControl.Item
					onClick={ () => onDurationChange( TERM_MONTHLY ) }
					selected={ duration === TERM_MONTHLY }
				>
					{ translate( 'Monthly' ) }
				</SegmentedControl.Item>

				<SegmentedControl.Item
					onClick={ () => onDurationChange( TERM_ANNUALLY ) }
					selected={ duration === TERM_ANNUALLY }
				>
					{ translate( 'Yearly' ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};

export default PlansFilterBar;
