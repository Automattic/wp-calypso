import { CustomSelectControl } from '@wordpress/components';
import DropdownOption from '../../dropdown-option';
import useIntervalOptions from '../hooks/use-interval-options';
import type { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../../../types';

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { hideDiscount, intervalType, displayedIntervals, onPlanIntervalChange } = props;
	const supportedIntervalType = (
		displayedIntervals.includes( intervalType ) ? intervalType : 'yearly'
	) as SupportedUrlFriendlyTermType;
	const optionsList = useIntervalOptions( props );

	const selectOptionsList = Object.values( optionsList ).map( ( option ) => ( {
		key: option.key,
		name: (
			<DropdownOption
				className="plan-type-selector__interval-type-dropdown-option"
				title={ option.name }
			>
				{ option.discountText && ! hideDiscount ? (
					<span className="discount"> { option.discountText } </span>
				) : null }
			</DropdownOption>
		),
	} ) );

	return (
		<div className="plan-type-selector__interval-type-dropdown-container">
			<CustomSelectControl
				className="plan-type-selector__interval-type-dropdown"
				label=""
				options={ selectOptionsList }
				value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
				onChange={ ( { selectedItem }: { selectedItem: { key: SupportedUrlFriendlyTermType } } ) =>
					onPlanIntervalChange && onPlanIntervalChange( selectedItem )
				}
			/>
		</div>
	);
};
