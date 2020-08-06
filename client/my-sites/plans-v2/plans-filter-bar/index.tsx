/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import SelectDropdown from 'components/select-dropdown';
import { TERM_MONTHLY, TERM_ANNUALLY } from 'lib/plans/constants';
import { PRODUCT_TYPE_OPTIONS } from '../constants';

/**
 * Type dependencies
 */
import type { Duration, ProductType } from '../types';

/**
 * Style dependencies
 */
import './style.scss';

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
			<SelectDropdown selectedText={ PRODUCT_TYPE_OPTIONS[ productType ].label }>
				{ Object.values( PRODUCT_TYPE_OPTIONS ).map( ( option ) => (
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
