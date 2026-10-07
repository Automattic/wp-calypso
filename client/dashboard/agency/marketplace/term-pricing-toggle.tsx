import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useAnalytics } from '../../app/analytics';
import { useMarketplaceType } from './use-marketplace-type';
import { useTermPricing } from './use-term-pricing';
import type { TermPricing } from './use-term-pricing';

import './term-pricing-toggle.scss';

/**
 * The billing term as a segmented control with both options named, so nothing
 * on the control changes when it is selected. The page's switch is Refer
 * products, a mode; the billing term is a choice between two options.
 */
export default function TermPricingToggle( { short = false }: { short?: boolean } ) {
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType } = useMarketplaceType();
	const { termPricing, setTermPricing } = useTermPricing();

	const handleChange = ( value: string | number | undefined ) => {
		const nextTerm: TermPricing = value === 'monthly' ? 'monthly' : 'yearly';
		setTermPricing( nextTerm );
		recordTracksEvent( 'calypso_a4a_marketplace_term_pricing_toggle', {
			term_pricing: nextTerm,
			purchase_mode: marketplaceType,
		} );
	};

	return (
		<div className={ clsx( 'dashboard-marketplace-term-pricing', { 'is-short': short } ) }>
			<ToggleGroupControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Billing' ) }
				hideLabelFromVision
				isBlock
				value={ termPricing }
				onChange={ handleChange }
			>
				<ToggleGroupControlOption
					value="monthly"
					label={ short ? __( 'Monthly' ) : __( 'Billed monthly' ) }
				/>
				<ToggleGroupControlOption
					value="yearly"
					label={ short ? __( 'Yearly' ) : __( 'Billed yearly' ) }
				/>
			</ToggleGroupControl>
		</div>
	);
}
