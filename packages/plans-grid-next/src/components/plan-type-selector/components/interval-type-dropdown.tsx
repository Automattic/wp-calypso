import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CustomSelectControl } from '@wordpress/components';
import { useRef } from 'react';
import DropdownOption from '../../dropdown-option';
import useIntervalOptions from '../hooks/use-interval-options';
import type { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../../../types';

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const {
		hideDiscount,
		intent,
		intervalType,
		displayedIntervals,
		onPlanIntervalUpdate,
		isInSignup,
	} = props;
	const supportedIntervalType = (
		displayedIntervals.includes( intervalType ) ? intervalType : 'yearly'
	) as SupportedUrlFriendlyTermType;
	const optionsList = useIntervalOptions( props );
	const hasOpenedDropdown = useRef( false );

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
		 ) as unknown as string,
	} ) );

	return (
		<div className="plan-type-selector__interval-type-dropdown-container">
			<CustomSelectControl
				onFocus={ () => {
					if ( ! hasOpenedDropdown.current ) {
						recordTracksEvent( 'calypso_plans_plan_type_selector_open', {
							plans_intent: intent,
							is_in_signup: isInSignup,
						} );
						hasOpenedDropdown.current = true;
					}
				} }
				className="plan-type-selector__interval-type-dropdown"
				label=""
				options={ selectOptionsList }
				value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
				onChange={ ( {
					selectedItem: { key: intervalType },
				}: {
					selectedItem: { key: string };
				} ) => {
					recordTracksEvent( 'calypso_plans_plan_type_selector_option_change', {
						interval_type: intervalType,
						plans_intent: intent,
						is_in_signup: isInSignup,
					} );
					onPlanIntervalUpdate &&
						onPlanIntervalUpdate( intervalType as SupportedUrlFriendlyTermType );
				} }
			/>
		</div>
	);
};
