const removeDuplicatedSlashes = ( url: string ) => url.replace( /(https?:\/\/)|(\/)+/g, '$1$2' );

const ensureProtocol = ( url: string ) => {
	if ( ! url.startsWith( 'http://' ) && ! url.startsWith( 'https://' ) ) {
		return `https://${ url }`;
	}
	return url;
};

export const getMigrationPluginInstallURL = ( fromUrl: string ) => {
	if ( fromUrl !== '' ) {
		const baseUrl = ensureProtocol( fromUrl );

		return removeDuplicatedSlashes(
			`${ baseUrl }/wp-admin/plugin-install.php?s=%2522wpcom%2520migration%2522&tab=search&type=term`
		);
	}

	return 'https://wordpress.org/plugins/wpcom-migration/';
};

export const getMigrationPluginPageURL = ( siteURL: string ) => {
	const baseUrl = ensureProtocol( siteURL );

	return removeDuplicatedSlashes( `${ baseUrl }/wp-admin/admin.php?page=wpcom-migration` );
};
