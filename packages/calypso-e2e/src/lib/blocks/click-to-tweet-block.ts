import { BaseBlock } from '../base-block';

const selectors = {
	tweetContent: '.wp-block-coblocks-click-to-tweet__text',
};

export class ClickToTweetBlock extends BaseBlock {
	async enterTweetContent( text: string ) {
		const textArea = await this.block.waitForSelector( selectors.tweetContent );
		await textArea.fill( text );
	}
}
