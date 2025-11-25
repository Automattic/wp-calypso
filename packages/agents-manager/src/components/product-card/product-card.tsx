import { executeAbility, getAbility } from '@wordpress/abilities';
import { Button } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { __, _n } from '@wordpress/i18n';
import PlaceholderImage from './placeholder-image';
import './style.scss';

/**
 * Simple WooCommerce Product Card Component
 * Based on the design shown in the screenshot
 */

interface ProductData {
	id?: string;
	name: string;
	price: number;
	currency?: string;
	type?: 'product' | 'booking';
	units?: number;
	image?: string;
	description?: string;
}

interface ProductCardProps {
	data: string | React.ReactNode; // JSON string from markdown or React children
}

/**
 * Render product card metadata (price and units)
 * @param {number} price    - Product price
 * @param {string} currency - Currency symbol
 * @param {number} units    - Number of units
 * @returns {string|null} Formatted metadata string or null
 */
const renderProductCardMeta = ( price: number, currency: string, units: number ): string | null => {
	const currencySymbol = currency ? decodeEntities( currency ) : '$';
	const renderUnits = ( count: number ) => {
		return `${ count } ${ _n( 'unit', 'units', count, 'agents-manager' ) }`;
	};

	if ( price && units ) {
		return `${ currencySymbol }${ price.toFixed( 2 ) } · ${ renderUnits( units ) }`;
	}
	if ( price ) {
		return `${ currencySymbol }${ price.toFixed( 2 ) }`;
	}
	if ( units ) {
		return renderUnits( units );
	}
	return null;
};

export default function ProductCard( { data }: ProductCardProps ) {
	let productData: ProductData;

	try {
		let jsonString = typeof data === 'string' ? data : String( data );

		// Clean up markdown code fences at start/end only
		jsonString = jsonString
			.replace( /^```[a-z]*\s*/i, '' ) // Remove opening fence at start
			.replace( /\s*```.*$/s, '' ); // Remove closing fence at end (with s flag for multiline)

		productData = JSON.parse( jsonString.trim() );
	} catch ( error ) {
		return (
			<div className="wc-product-card wc-product-card--error">
				<p>{ __( 'Error: Could not render product card', 'agents-manager' ) }</p>
			</div>
		);
	}

	if ( ! productData.name ) {
		return (
			<div className="wc-product-card wc-product-card--error">
				<p>{ __( 'Error: Product name is required', 'agents-manager' ) }</p>
			</div>
		);
	}

	const handleEdit = async () => {
		if ( ! productData.id ) {
			return;
		}

		// Check if the navigate ability is registered.
		try {
			const navigateAbility = await getAbility( 'ciab-admin/navigate' );
			const hasNavigateAbility = !! navigateAbility;

			if ( hasNavigateAbility ) {
				const editLink = `/woocommerce/products/edit/${ productData.id }`;
				await executeAbility( 'ciab-admin/navigate', {
					path: editLink,
				} );
				return;
			}
		} catch ( error ) {
			// Fall through to default behavior.
		}

		// Fallback to opening WP admin in new tab.
		const editUrl = `/wp-admin/post.php?post=${ productData.id }&action=edit`;
		window.open( editUrl, '_blank' );
	};

	const getCardTitle = () => {
		switch ( productData.type ) {
			case 'booking':
				return __( 'Service', 'agents-manager' );
			case 'product':
			default:
				return __( 'Product', 'agents-manager' );
		}
	};

	return (
		<div className="wc-product-card">
			{ /* Header */ }
			<div className="wc-product-card__header">
				<div className="wc-product-card__title">{ getCardTitle() }</div>
				<Button onClick={ handleEdit } type="button">
					{ __( 'Edit', 'agents-manager' ) }
				</Button>
			</div>

			{ /* Product Info */ }
			<div className="wc-product-card__content">
				{ /* Product Image */ }
				{ productData.image ? (
					<img
						className="wc-product-card__image"
						src={ productData.image }
						alt={ productData.name }
					/>
				) : (
					<PlaceholderImage className="wc-product-card__image" />
				) }

				{ /* Product Details */ }
				<div className="wc-product-card__details">
					<div className="wc-product-card__name">
						<strong>{ productData.name }</strong>
					</div>
					<div className="wc-product-card__meta">
						{ renderProductCardMeta(
							productData.price,
							productData.currency || '$',
							productData.units || 0
						) }
					</div>
				</div>
			</div>
		</div>
	);
}
