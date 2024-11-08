import config from '@automattic/calypso-config';

const removeDuplicatedSlashes = ( url: string ) => url.replace( /(https?:\/\/)|(\/)+/g, '$1$2' );
const isWhiteLabeledPluginEnabled = config.isEnabled(
	'migration-flow/enable-white-labeled-plugin'
);

const ensureProtocol = ( url: string ) => {
	if ( ! url.startsWith( 'http://' ) && ! url.startsWith( 'https://' ) ) {
		return `https://${ url }`;
	}
	return url;
};

export const getMigrationPluginInstallURL = ( fromUrl: string ) => {
	if ( fromUrl !== '' ) {
		const baseUrl = ensureProtocol( fromUrl );

		if ( isWhiteLabeledPluginEnabled ) {
			return removeDuplicatedSlashes(
				`${ baseUrl }/wp-admin/plugin-install.php?s=%2522wpcom%2520migration%2522&tab=search&type=term`
			);
		}

		return removeDuplicatedSlashes(
			`${ baseUrl }/wp-admin/plugin-install.php?s=%2522migrate%2520guru%2522&tab=search&type=term`
		);
	}

	return isWhiteLabeledPluginEnabled
		? 'https://wordpress.org/plugins/wpcom-migration/'
		: 'https://wordpress.org/plugins/migrate-guru/';
};

export const getMigrationPluginPageURL = ( siteURL: string ) => {
	const baseUrl = ensureProtocol( siteURL );

	if ( isWhiteLabeledPluginEnabled ) {
		return removeDuplicatedSlashes( `${ baseUrl }/wp-admin/admin.php?page=wpcom-migration` );
	}

	return removeDuplicatedSlashes( `${ baseUrl }/wp-admin/admin.php?page=migrateguru` );
};
