import { Page } from 'playwright';
import { DomainSearchComponent } from '../../components';

/**
 * Page representing the `/start/domains` step in the signup flow.
 */
export class SignupDomainPage {
	private domainSearchComponent: DomainSearchComponent;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( private page: Page ) {
		this.domainSearchComponent = new DomainSearchComponent( page );
	}

	/**
	 * Skips the domain selection screen.
	 */
	async skipDomainSelection(): Promise< void > {
		const locator = this.page.locator( 'button:has-text("Choose my domain later"):visible' );
		await locator.click();
	}
}
