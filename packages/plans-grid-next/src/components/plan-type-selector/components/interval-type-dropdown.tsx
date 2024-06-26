import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CustomSelectControl } from '@wordpress/components';
import DropdownOption from '../../dropdown-option';
import useIntervalOptions from '../hooks/use-interval-options';
import type { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../../../types';

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { hideDiscount, intent, intervalType, displayedIntervals, onPlanIntervalUpdate } = props;
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
				onChange={ ( {
					selectedItem: { key: intervalType },
				}: {
					selectedItem: { key: SupportedUrlFriendlyTermType };
				} ) => {
					recordTracksEvent( 'calypso_plans_plan_type_selector_option_change', {
						interval_type: intervalType,
						plans_intent: intent,
					} );
					onPlanIntervalUpdate && onPlanIntervalUpdate( intervalType );
				} }
			/>
		</div>
	);
};
