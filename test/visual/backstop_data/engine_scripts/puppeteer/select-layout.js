module.exports = async ( page, scenario, vp ) => {
	const elementHandle = await page.$('iframe.is-loaded');
	const frame = await elementHandle.contentFrame();

	await frame.click( `button[value="${scenario.label}"]` );
	await page.waitForTimeout( 10000 );
};
