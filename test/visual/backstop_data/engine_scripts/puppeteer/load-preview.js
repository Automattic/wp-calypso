module.exports = async ( page ) => {
	await page.waitForTimeout( 5000 );
	await page.reload( { waitUntil: [ 'networkidle0', 'domcontentloaded' ] } );
	await page.waitForTimeout( 2000 );
};
