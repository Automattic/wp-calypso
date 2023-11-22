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
		console.log( 'async skipDomainSelection(): Promise< void > {' );
		console.log( this.page.getByRole( 'button', { name: 'Choose my domain later', exact: true } ) );
		console.log( this.page.getByRole( 'button', { name: 'Skip Purchase', exact: true } ) );
		// await this.page.getByRole( 'button', { name: 'Skip Purchase', exact: true } ).click();
		await this.page.getByRole( 'button', { name: 'Choose my domain later', exact: true } ).click();
	}
}
