import { localize } from 'i18n-calypso';

function JetpackMileswebLogo( { darkColorScheme, translate } ) {
	const img = darkColorScheme
		? 'jetpack-milesweb-connection-dark.webp'
		: 'jetpack-milesweb-connection.webp';
	return (
		<img
			alt={
				// translators: partnerName is something like MilesWeb, WooCommerce or DreamHost
				translate( 'Co-branded Jetpack and %(partnerName)s logo', {
					args: { partnerName: 'MilesWeb' },
				} )
			}
			height="85px"
			src={ `/calypso/images/jetpack/${ img }` }
			width="662.5px"
		/>
	);
}

export default localize( JetpackMileswebLogo );
