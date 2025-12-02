export interface CancellationOffer {
	/** Product ID */
	product_id: number;

	/** Product slug identifier */
	product_slug: string;

	/** Human-readable product name */
	product_name: string;

	/** Currency code (e.g., 'USD', 'EUR') */
	currency_code: string;

	/** Original price amount (before discount) */
	original_price: number;

	/** Discounted price amount (raw number) */
	raw_price: number;

	/** Formatted price string (e.g., '$10') */
	formatted_price: string;

	/** Discount percentage as an integer (e.g., 20 for 20% off) */
	discount_percentage: number;

	/** Number of renewal periods the discount applies to */
	discounted_periods: number;
}
