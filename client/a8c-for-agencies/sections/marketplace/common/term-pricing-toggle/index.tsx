import {
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext } from 'react';
import { TermPricingContext } from '../../context';

export default function TermPricingToggle() {
	const { termPricing, toggleTermPricing } = useContext( TermPricingContext );

	const handleToggle = () => {
		toggleTermPricing();
	};

	const isChecked = termPricing === 'yearly';

	return (
		<HStack className="a4a-marketplace__term-pricing-toggle" justify="flex-start" spacing={ 0 }>
			<Text weight={ 500 }>{ __( 'Billed:' ) }</Text>
			<Text as="span" variant={ isChecked ? 'muted' : undefined } style={ { marginInline: '8px' } }>
				{ __( 'Monthly' ) }
			</Text>
			<ToggleControl
				__nextHasNoMarginBottom
				checked={ isChecked }
				onChange={ handleToggle }
				label={ undefined }
			/>
			<Text as="span" variant={ ! isChecked ? 'muted' : undefined }>
				{ __( 'Yearly' ) }
			</Text>
		</HStack>
	);
}
