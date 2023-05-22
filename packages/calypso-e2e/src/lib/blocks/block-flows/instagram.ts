import { BlockFlow, EditorContext, PublishedPostContext } from '.';

interface ConfigurationData {
	embedUrl: string;
	expectedPostText: string;
}

const blockParentSelector = '[aria-label="Block: Embed"]:has-text("Instagram URL")';
const selectors = {
	embedUrlInput: `${ blockParentSelector } input`,
	embedButton: `${ blockParentSelector } button:has-text("Embed")`,
	embedIframe: `iframe[title="Embedded content from instagram.com"]`,
	instagramIframe: `iframe.instagram-media`,
};

/**
 * Class representing the flow of using an Instagram block in the editor
 */
export class InstagramBlockFlow implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Instagram';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const editorCanvas = await context.editorPage.getEditorCanvas();
		const embedUrlLocator = editorCanvas.locator( selectors.embedUrlInput );
		await embedUrlLocator.fill( this.configurationData.embedUrl );

		const embedButtonLocator = editorCanvas.locator( selectors.embedButton );
		await embedButtonLocator.click();

		const response = {
			version: '1.0',
			author_name: 'woocommerce',
			provider_name: 'Instagram',
			provider_url: 'https://www.instagram.com/',
			html: '<a href="">A post shared by WooCommerce (@woocommerce)</a>',
		};

		// Intercept the embed request to Instagram to fulfill with dummy data.
		// This data will not fully render the block, but will decouple our test
		// results from any issues Instagram-side (eg. request blocking, server outage).
		await context.page.route( /instagram.com/, ( route ) => {
			route.fulfill( {
				body: JSON.stringify( response ),
				headers: {
					Allow: 'GET',
				},
			} );
		} );

		// Wait for the embed iframe to render alongside placeholder text.
		await editorCanvas
			.frameLocator( selectors.embedIframe )
			.getByText( 'View this post on Instagram' )
			.waitFor();
	}

	/**
	 * Validate the block in the published post.
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		await context.page.getByText( 'View this post on Instagram' ).waitFor();
	}
}
