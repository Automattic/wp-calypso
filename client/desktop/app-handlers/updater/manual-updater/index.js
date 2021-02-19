/**
 * External Dependencies
 */
const { app, shell } = require( 'electron' );
const fetch = require( 'electron-fetch' ).default;
const yaml = require( 'js-yaml' );
const semver = require( 'semver' );

/**
 * Internal dependencies
 */
const Updater = require( 'calypso/desktop/lib/updater' );
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:updater:manual' );
const {
	bumpStat,
	sanitizeVersion,
	getPlatform,
} = require( 'calypso/desktop/lib/desktop-analytics' );

const statsPlatform = getPlatform( process.platform );
const sanitizedVersion = sanitizeVersion( app.getVersion() );

const getStatsString = ( isBeta ) =>
	`${ statsPlatform }${ isBeta ? '-b' : '' }-${ sanitizedVersion }`;

const requestOptions = {
	headers: {
		'User-Agent': `WP-Desktop/${ app.getVersion() }`,
	},
};

// Comparison fn to sort Github releases by published date (descending)
function compareByPublishedDate( lhs, rhs ) {
	return new Date( lhs.published_at ) > new Date( rhs.published_at ) ? -1 : 1;
}

class ManualUpdater extends Updater {
	constructor( { apiUrl, downloadUrl, options = {} } ) {
		super( options );

		this.apiUrl = apiUrl;
		this.downloadUrl = downloadUrl;

		this.isEffectiveBeta = false;
	}

	async ping() {
		try {
			const url = this.apiUrl;
			log.info(
				`Checking for update. Channel: ${
					this.beta
				}, Version: ${ app.getVersion() }, Update URL: ${ url }`
			);

			const releaseResp = await fetch( url, requestOptions );

			if ( releaseResp.status !== 200 ) {
				return;
			}

			const releases = await releaseResp.json();

			// Sort by published date (descending)
			releases.sort( compareByPublishedDate );

			// Get latest release and pre-release from sorted releases
			const latestStableRelease = releases.find(
				( d ) => ! d.prerelease && this.getConfigUrl( d.assets )
			);
			const latestBetaRelease = releases.find(
				( d ) => d.prerelease && this.getConfigUrl( d.assets )
			);

			if ( ! latestStableRelease && ! this.beta ) {
				log.info( 'No stable release found, skipping update.' );
				return;
			}

			let latestStableReleaseVersion;
			if ( latestStableRelease ) {
				log.info(
					`Latest stable release: ${ latestStableRelease.name } (${ latestStableRelease.tag_name })`
				);
				const assetUrl = this.getConfigUrl( latestStableRelease.assets );
				latestStableReleaseVersion = await this.getReleaseVersion( assetUrl );
			}

			let latestReleaseVersion;

			if ( this.beta && latestBetaRelease ) {
				log.info(
					`Latest beta release: ${ latestBetaRelease.name } (${ latestBetaRelease.tag_name })`
				);
				const assetUrl = this.getConfigUrl( latestBetaRelease.assets );
				const latestBetaReleaseVersion = await this.getReleaseVersion( assetUrl );

				if (
					semver.valid( latestStableReleaseVersion ) &&
					semver.valid( latestBetaReleaseVersion ) &&
					semver.lt( latestBetaReleaseVersion, latestStableReleaseVersion )
				) {
					latestReleaseVersion = latestStableReleaseVersion;

					log.info(
						'Latest stable version is newer than latest latest beta. Switching to stable channel:',
						latestReleaseVersion
					);
				} else if ( semver.valid( latestBetaReleaseVersion ) ) {
					latestReleaseVersion = latestBetaReleaseVersion;

					this.isEffectiveBeta = true;
				}
			} else if ( latestStableReleaseVersion ) {
				latestReleaseVersion = latestStableReleaseVersion;
			}

			if ( ! latestReleaseVersion ) {
				log.info( 'No release found' );

				return;
			}

			if ( semver.lt( app.getVersion(), latestReleaseVersion ) ) {
				log.info( 'New update is available, prompting user to update to', latestReleaseVersion );
				bumpStat( 'wpcom-desktop-update-check', `${ getStatsString( this.beta ) }-needs-update` );

				this.setVersion( latestReleaseVersion );
				this.notify();
			} else {
				log.info( 'Update is not available' );
				bumpStat( 'wpcom-desktop-update-check', `${ getStatsString( this.beta ) }-no-update` );

				return;
			}
		} catch ( err ) {
			log.error( `Update check failed with error: ${ err.message }` );
			bumpStat( 'wpcom-desktop-update-check', `${ getStatsString( this.beta ) }-check-failed` );
		}
	}

	onConfirm() {
		shell.openExternal( `${ this.downloadUrl }${ this.isEffectiveBeta ? '?beta=1' : '' }` );

		bumpStat( 'wpcom-desktop-update', `${ getStatsString( this.beta ) }-dl-update` );
	}

	onCancel() {
		bumpStat( 'wpcom-desktop-update', `${ getStatsString( this.beta ) }-update-cancel` );
	}

	getConfigUrl( assets ) {
		if ( ! assets ) {
			return null;
		}
		if ( ! Array.isArray( assets ) ) {
			return null;
		}
		const asset = assets.find( ( file ) => file.name === 'latest.yml' );
		return asset ? asset.browser_download_url : null;
	}

	async getReleaseVersion( url ) {
		try {
			const resp = await fetch( url, requestOptions );

			if ( resp.status !== 200 ) {
				return null;
			}

			const body = await resp.text();
			const config = yaml.safeLoad( body );

			return config.version || null;
		} catch ( err ) {
			log.error( `Failed to get release version: ${ err.message }` );
		}
	}
}

module.exports = ManualUpdater;
