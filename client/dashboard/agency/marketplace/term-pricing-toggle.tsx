import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useMarketplaceType } from './use-marketplace-type';
import { useTermPricing } from './use-term-pricing';
import type { TermPricing } from './use-term-pricing';

export default function TermPricingToggle() {
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType } = useMarketplaceType();
	const { termPricing, setTermPricing } = useTermPricing();

	const handleToggle = ( checked: boolean ) => {
		const nextTerm: TermPricing = checked ? 'yearly' : 'monthly';
		setTermPricing( nextTerm );
		recordTracksEvent( 'calypso_a4a_marketplace_term_pricing_toggle', {
			term_pricing: nextTerm,
			purchase_mode: marketplaceType,
		} );
	};

	return (
		<ToggleControl
			__nextHasNoMarginBottom
			checked={ termPricing === 'yearly' }
			label={ __( 'Billed annually' ) }
			onChange={ handleToggle }
		/>
	);
}
