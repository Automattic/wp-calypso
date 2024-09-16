import config from '@automattic/calypso-config';

const removeDuplicatedSlashes = ( url: string ) => url.replace( /(https?:\/\/)|(\/)+/g, '$1$2' );
const isWhiteLabeledPluginEnabled = config.isEnabled(
	'migration-flow/enable-white-labeled-plugin'
);

export const getPluginInstallationPage = ( fromUrl: string ) => {
	if ( fromUrl !== '' ) {
		if ( isWhiteLabeledPluginEnabled ) {
			return removeDuplicatedSlashes(
				`${ fromUrl }/wp-admin/plugin-install.php?s=%2522wpcom%2520migration%2522&tab=search&type=term`
			);
		}

		return removeDuplicatedSlashes(
			`${ fromUrl }/wp-admin/plugin-install.php?s=%2522migrate%2520guru%2522&tab=search&type=term`
		);
	}

	return isWhiteLabeledPluginEnabled
		? 'https://wordpress.org/plugins/wpcom-migration/'
		: 'https://wordpress.org/plugins/migrate-guru/';
};

export const getMigrateGuruPageURL = ( siteURL: string ) => {
	if ( isWhiteLabeledPluginEnabled ) {
		return removeDuplicatedSlashes( `${ siteURL }/wp-admin/admin.php?page=wpcom-migration` );
	}

	return removeDuplicatedSlashes( `${ siteURL }/wp-admin/admin.php?page=migrateguru` );
};
