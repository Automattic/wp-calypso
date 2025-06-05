import { Locator, Page } from 'playwright';

export interface ExpectedFormField {
	type: 'textbox' | 'checkbox' | 'radio' | 'combobox' | 'button';
	accessibleName: string;
}

interface FieldLabelDetails {
	blockName: string;
	accessibleLabelName: string;
	labelText: string;
}

/**
 * Makes a selector for a block based on the block name.
 * Blocks often follow a predictable pattern using aria-labels, and this centralizes that!
 *
 * @param {string} blockName The name of the block, often how it appears in the sidebar.
 * @returns A selector string to use to make a locator for the block.
 */
export function makeSelectorFromBlockName( blockName: string ): string {
	return `[aria-label="Block: ${ blockName }"]`;
}

/**
 * A shared validate function for published form blocks.
 *
 * @param {Locator | Page} publishedPage A locator/page object for the published page.
 * @param {ExpectedFormField[]} expectedFormFields An array of fields to validate.
 */
export async function validatePublishedFormFields(
	publishedPage: Locator | Page,
	expectedFormFields: ExpectedFormField[]
) {
	for ( const expectedField of expectedFormFields ) {
		const { type, accessibleName } = expectedField;
		await publishedPage.getByRole( type, { name: accessibleName } ).first().waitFor();
	}
}

/**
 * Labels a field block within the form.
 *
 * @param {Locator} parentFormBlock Locator for the parent form block.
 * @param {FieldLabelDetails} details The details for labeling.
 */
export async function labelFormFieldBlock(
	parentFormBlock: Locator,
	{
		blockName,
		accessibleLabelName,
		labelText,
		parentBlockName = undefined,
		isRefactor = false,
	}: {
		blockName: string;
		accessibleLabelName: string;
		labelText: string;
		parentBlockName?: string;
		isRefactor?: boolean;
	}
) {
	let scope = parentFormBlock;
	if ( isRefactor && parentBlockName ) {
		scope = scope.locator( makeSelectorFromBlockName( parentBlockName ) );
	}
	await scope
		.locator( makeSelectorFromBlockName( blockName ) )
		.getByRole( 'textbox', { name: accessibleLabelName } )
		.first()
		.fill( labelText );
}
