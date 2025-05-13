import { Page } from 'playwright';
import { clickNavTabBase } from '../../element-helper';

const navTabParent = '.stats-navigation';

const selectors = {
	navTabItem: ( { name = '', selected = false }: { name?: string; selected?: boolean } = {} ) =>
		`${ navTabParent } .navigation-tab${ selected ? '.is-active' : '' }:has-text("${ name }")`,
	navTabMobileToggleButton: `${ navTabParent } button.section-nav__mobile-header`,
};

/**
 * Locates and clicks on a specified tab on the NavTab.
 *
 * NavTabs are used throughout calypso to contain sub-pages within the parent page.
 * For instance, on the Media gallery page a NavTab is used to filter the gallery to
 * show a specific category of gallery items.
 *
 * @param {Page} page Underlying page on which interactions take place.
 * @param {string} name Name of the tab to be clicked.
 * @throws {Error} If the tab name is not the active tab.
 */
async function clickNavTab(
	page: Page,
	name: string,
	{ force }: { force?: boolean } = {}
): Promise< void > {
	await clickNavTabBase( page, name, selectors.navTabItem, selectors.navTabMobileToggleButton, {
		force,
	} );
}

export { clickNavTab };
