import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';

import './style.scss';

interface BundlePriceProps {
	originalPrice: string;
	bundlePrice: string;
	renewalPrice?: string;
	size?: number;
	alignment?: 'left' | 'right';
	className?: string;
}

/**
 * Render a bundle price: the struck-through original followed by the discounted
 * bundle price in green, with an optional "For first year. X/year renewal."
 * subline. Modelled on `DomainSuggestionPrice` but context-free — size and
 * alignment are props instead of being read from the suggestion list context.
 */
export const BundlePrice = ( {
	originalPrice,
	bundlePrice,
	renewalPrice,
	size = 20,
	alignment = 'left',
	className,
}: BundlePriceProps ) => {
	const { __ } = useI18n();

	const subText = renewalPrice
		? createInterpolateElement(
				sprintf(
					// translators: %(price)s is the renewal price of the domain bundle.
					__( 'For first year. <span>%(price)s/year renewal.</span>' ),
					{ price: renewalPrice }
				),
				{ span: <span style={ { whiteSpace: 'nowrap' } } /> }
		  )
		: null;

	return (
		<VStack spacing={ 0 } className={ clsx( 'bundle-price', className ) }>
			<HStack spacing={ 3 } justify={ alignment === 'left' ? 'start' : 'end' } expanded={ false }>
				<Text
					as="s"
					size={ size }
					variant="muted"
					className="bundle-price__original"
					aria-label={ sprintf(
						// translators: %(price)s is the original price of the domain bundle.
						__( 'Original price: %(price)s' ),
						{ price: originalPrice }
					) }
				>
					{ originalPrice }
				</Text>
				<Text
					size={ size }
					color="var( --domain-search-promotional-price-color )"
					aria-label={ sprintf(
						// translators: %(price)s is the discounted bundle price.
						__( 'Bundle price: %(price)s' ),
						{ price: bundlePrice }
					) }
				>
					{ bundlePrice }
				</Text>
			</HStack>
			{ subText && (
				<Text size="body" align={ alignment } variant="muted" className="bundle-price__sub-text">
					{ subText }
				</Text>
			) }
		</VStack>
	);
};
