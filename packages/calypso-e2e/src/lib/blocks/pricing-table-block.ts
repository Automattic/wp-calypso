import { BaseBlock } from '../base-block';

const selectors = {
	pricing: '.wp-block-coblocks-pricing-table-item__amount',
};

export class PricingTableBlock extends BaseBlock {
	async enterPrice( side: 'left' | 'right', price: string): Promise<void> {
		const index = side === 'left' ? 1 : 2;
		const priceHandler = await this.block.waitForSelector(
			`:nth-match(${ selectors.pricing }, ${ index })`
		);
		await priceHandler.fill( price );
	}
}
