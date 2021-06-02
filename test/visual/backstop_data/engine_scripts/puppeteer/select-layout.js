module.exports = async ( page, scenario ) => {
	await page.goto( 'https://wordpress.com/page/e2evisualregressions.wordpress.com' );
	await page.waitForSelector( 'iframe.is-loaded' );
	const editorURL = await page.evaluate(
		'document.querySelector("iframe.is-loaded").getAttribute("src")'
	);
	await page.goto( editorURL );
	await page.waitForSelector( '.components-modal__screen-overlay' );

	switch ( scenario.label ) {
		case 'about':
		case 'about-2':
		case 'about-3':
		case 'about-4':
		case 'about-5':
		case 'about-me-3':
			await page.click( 'button[data-slug="about"]' );
			break;
		case 'edison':
		case 'cassel':
		case 'seedlet':
		case 'blog':
		case 'blog-2':
		case 'blog-3':
		case 'blog-4':
		case 'blog-5':
		case 'blog-6':
			await page.click( 'button[data-slug="blog"]' );
			break;
		case 'overton':
		case 'maywood':
		case 'easley':
		case 'camdem':
		case 'brice':
		case 'barnsbury':
		case 'vesta':
		case 'stratford':
		case 'rockfield':
		case 'leven':
		case 'gibbs':
		case 'coutoire':
		case 'balasana':
		case 'alves':
		case 'twenty-twenty':
		case 'shawburn':
		case 'exford':
		case 'morden':
		case 'stow':
		case 'hever':
		case 'reynolds':
		case 'rivington':
		case 'bowen':
		case 'doyle':
			await page.click( 'button[data-slug="home"]' );
			break;
		case 'portfolio-8':
		case 'portfolio-7':
		case 'portfolio-6':
		case 'portfolio-5':
		case 'portfolio-4':
		case 'portfolio-3':
		case 'portfolio-2':
		case 'portfolio':
		case 'team':
			await page.click( 'button[data-slug="gallery"]' );
			break;
		case 'services':
		case 'services-2':
		case 'menu':
			await page.click( 'button[data-slug="services"]' );
			break;
		case 'contact-10':
		case 'contact-9':
		case 'contact-8':
		case 'contact-6':
			await page.click( 'button[data-slug="contact"]' );
			break;
		default:
			break;
	}

	await page.waitForTimeout( 1000 );
	await page.click( `button[value="${ scenario.label }"]` );
	await page.waitForTimeout( 10000 );
};
