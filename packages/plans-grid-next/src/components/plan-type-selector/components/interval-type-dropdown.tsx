import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CustomSelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();

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
		accessibleName: option.name as string,
	} ) );

	const selectedOption = selectOptionsList.find( ( { key } ) => key === supportedIntervalType );
	// Translators: This is a description of the currently selected billing period for accessibility.
	// billingPeriod is the name of the billing period and it's translated.
	const describedByText = selectedOption?.accessibleName
		? translate( 'Currently selected billing period: %(billingPeriod)s', {
				args: { billingPeriod: selectedOption.accessibleName },
		  } )
		: undefined;

	return (
		<div className="plan-type-selector__interval-type-dropdown-container">
			<CustomSelectControl
				__next40pxDefaultSize
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
				describedBy={ describedByText as string }
				options={ selectOptionsList }
				value={ selectedOption }
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
