import { Page } from 'playwright';

const selectors = {
	nameInput: '#setup-form-input-name',
	continueButton: '.setup-form__submit',
};

/**
 * Represents the "setup" step (newsletter name + description) of the Stepper newsletter flow.
 */
export class NewsletterSetupPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Enters the newsletter name and submits the step, advancing to the goals step.
	 *
	 * @param {string} name The newsletter name.
	 */
	async enterNameAndContinue( name: string ): Promise< void > {
		await this.page.fill( selectors.nameInput, name );
		await this.page.click( selectors.continueButton );
	}
}
