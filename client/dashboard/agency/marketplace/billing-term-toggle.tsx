import {
	FormToggle,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import './billing-term-toggle.scss';

export type BillingTerm = 'monthly' | 'yearly';

/**
 * A4AD-196 / A4AD-197: the billing cadence with both states named, so nothing
 * on the control changes when it is tapped. Yearly is the default, matching
 * the current marketplace.
 *
 * Two treatments, compared for i4:
 *   segmented  (default, chosen) a two-option segmented control. Cursor, Claude, Grok, ElevenLabs.
 *   toggle     a switch with a fixed label on each side. Webflow, Coda, Descript.
 * Switch with ?billing=toggle. Segmented won because the page already has a
 * switch (Refer products) and that one is a mode; cadence is a choice.
 */
export default function BillingTermToggle( {
	term,
	onChange,
}: {
	term: BillingTerm;
	onChange: ( term: BillingTerm ) => void;
} ) {
	const annual = term === 'yearly';
	const variant = new URLSearchParams( window.location.search ).get( 'billing' ) ?? 'segmented';

	if ( variant === 'segmented' ) {
		return (
			<ToggleGroupControl
				className="marketplace-billing-segmented"
				__nextHasNoMarginBottom
				__next40pxDefaultSize={ false }
				label={ __( 'Billing' ) }
				hideLabelFromVision
				isBlock={ false }
				value={ term }
				onChange={ ( value ) => onChange( value === 'monthly' ? 'monthly' : 'yearly' ) }
			>
				<ToggleGroupControlOption value="monthly" label={ __( 'Billed monthly' ) } />
				<ToggleGroupControlOption value="yearly" label={ __( 'Billed yearly' ) } />
			</ToggleGroupControl>
		);
	}

	return (
		<HStack spacing={ 2 } expanded={ false } alignment="center">
			<Text size={ 13 } weight={ 400 } variant={ annual ? 'muted' : undefined }>
				{ __( 'Billed monthly' ) }
			</Text>
			{ /* The bare switch, so the row's gap is the same on both sides.
			   ToggleControl keeps room for a label even when it is hidden. */ }
			<FormToggle
				checked={ annual }
				aria-label={ __( 'Billed yearly' ) }
				onChange={ ( event ) => onChange( event.target.checked ? 'yearly' : 'monthly' ) }
			/>
			<Text size={ 13 } weight={ 400 } variant={ annual ? undefined : 'muted' }>
				{ __( 'Billed yearly' ) }
			</Text>
		</HStack>
	);
}
