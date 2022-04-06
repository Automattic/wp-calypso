import { BlockFlow, EditorContext, PublishedPostContext } from '..';

const wholeRatings = [ 1, 2, 3, 4, 5 ] as const;
type WholeRating = typeof wholeRatings[ number ];

const halfRatings = [ 0.5, 1.5, 2.5, 3.5, 4.5 ] as const;
type HalfRating = typeof halfRatings[ number ];

type StarRating = WholeRating | HalfRating;

interface ConfigurationData {
	rating: StarRating;
}

const blockParentSelector = '[aria-label="Block: Star Rating"]';
const selectors = {
	starButton: ( nthIndex: number ) => `.jetpack-ratings-button:nth-child(${ nthIndex })`,
};

/**
 * Class representing the flow of using a Star Rating block in the editor.
 */
export class StarRatingBlock implements BlockFlow {
	private configurationData: ConfigurationData;

	/**
	 * Constructs an instance of this block flow with data to be used when configuring and validating the block.
	 *
	 * @param {ConfigurationData} configurationData data with which to configure and validate the block
	 */
	constructor( configurationData: ConfigurationData ) {
		this.configurationData = configurationData;
	}

	blockSidebarName = 'Star Rating';
	blockEditorSelector = blockParentSelector;

	/**
	 * Configure the block in the editor with the configuration data from the constructor
	 *
	 * @param {EditorContext} context The current context for the editor at the point of test execution
	 */
	async configure( context: EditorContext ): Promise< void > {
		const rating = this.configurationData.rating;
		if ( rating === 1 ) {
			// This is the default when you add the block -- we're done here.
			return;
		}

		if ( rating === 0.5 ) {
			const oneStarLocator = context.editorLocator.locator( selectors.starButton( 1 ) );
			await oneStarLocator.click();
			return;
		}

		if ( wholeRatings.includes( rating as WholeRating ) ) {
			const starButtonLocator = context.editorLocator.locator( selectors.starButton( rating ) );
			await starButtonLocator.click();
			return;
		}

		if ( halfRatings.includes( rating as HalfRating ) ) {
			const starNthIndex = Math.ceil( rating );
			const starButtonLocator = context.editorLocator.locator(
				selectors.starButton( starNthIndex )
			);
			// Two clicks creates a half star rating.
			await starButtonLocator.click();
			await starButtonLocator.click();
			return;
		}

		throw new Error( `${ rating } is not a valid Star Rating value.` );
	}

	/**
	 * Validate the block in the published post
	 *
	 * @param {PublishedPostContext} context The current context for the published post at the point of test execution
	 */
	async validateAfterPublish( context: PublishedPostContext ): Promise< void > {
		// This is screen-reader text, and the easiest way to validate the star rating.
		const expectedTextLocator = context.page.locator(
			`text=Rating: ${ this.configurationData.rating } out of 5.`
		);
		// Because it's not actually visual text on the page, we're using 'attached' state instead of default of 'visible'.
		await expectedTextLocator.waitFor( { state: 'attached' } );
	}
}
