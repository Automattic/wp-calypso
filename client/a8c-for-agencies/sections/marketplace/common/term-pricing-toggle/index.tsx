import {
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { MarketplaceTypeContext, TermPricingContext } from '../../context';

export default function TermPricingToggle() {
	const dispatch = useDispatch();

	const { termPricing, toggleTermPricing } = useContext( TermPricingContext );
	const { marketplaceType } = useContext( MarketplaceTypeContext );

	const isChecked = termPricing === 'yearly';

	const handleToggle = () => {
		toggleTermPricing();
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_term_pricing_toggle', {
				term_pricing: isChecked ? 'monthly' : 'yearly',
				purchase_mode: marketplaceType,
			} )
		);
	};

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
