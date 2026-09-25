import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useMarketplaceType } from './use-marketplace-type';
import { useTermPricing } from './use-term-pricing';
import type { TermPricing } from './use-term-pricing';

import './term-pricing-toggle.scss';

export default function TermPricingToggle() {
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType } = useMarketplaceType();
	const { termPricing, setTermPricing } = useTermPricing();

	const handleChange = ( value?: string | number ) => {
		const nextTerm: TermPricing = value === 'monthly' ? 'monthly' : 'yearly';
		setTermPricing( nextTerm );
		recordTracksEvent( 'calypso_a4a_marketplace_term_pricing_toggle', {
			term_pricing: nextTerm,
			purchase_mode: marketplaceType,
		} );
	};

	return (
		<div className="dashboard-marketplace-term-pricing-toggle">
			<ToggleGroupControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				isBlock
				label={ __( 'Billing term' ) }
				hideLabelFromVision
				value={ termPricing }
				onChange={ handleChange }
			>
				<ToggleGroupControlOption value="monthly" label={ __( 'Billed monthly' ) } />
				<ToggleGroupControlOption value="yearly" label={ __( 'Billed yearly' ) } />
			</ToggleGroupControl>
		</div>
	);
}
