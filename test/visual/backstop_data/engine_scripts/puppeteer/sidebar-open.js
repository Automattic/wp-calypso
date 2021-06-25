module.exports = async ( page, scenario, vp ) => {
	if ( vp.label === 'phone' ) {
		await page.click( 'a.masterbar__item[data-tip-target="my-sites"]' );
		await page.waitForSelector( 'div.focus-sidebar' );
	}

	await page.waitForSelector( '.sidebar .sidebar__region', { visible: true } );
};
