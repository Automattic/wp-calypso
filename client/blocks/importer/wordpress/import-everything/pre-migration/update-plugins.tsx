import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import { Title, SubTitle, SelectItems } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { jetpack } from 'calypso/signup/icons';
import { URL } from 'calypso/types';

interface Props {
	isMigrateFromWp: boolean;
	sourceSiteUrl: URL;
	migrationTrackingProps?: Record< string, unknown >;
}

export const UpdatePluginInfo: React.FunctionComponent< Props > = ( props: Props ) => {
	const translate = useTranslate();
	const { isMigrateFromWp, sourceSiteUrl, migrationTrackingProps } = props;

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_show_update_info', {
			plugins_info: isMigrateFromWp ? 'wpcom_migration_plugin' : 'jetpack',
			...migrationTrackingProps,
		} );
	}, [] );

	function renderTitle() {
		return isMigrateFromWp
			? translate( `Update ‘Move to WordPress.com’` )
			: translate( `Install Jetpack` );
	}

	function renderSubTitle() {
		return isMigrateFromWp
			? translate( `The latest version of the plugin is required to migrate all the content` )
			: translate( `Jetpack is required to migrate all the content` );
	}

	function renderSelectBoxContent() {
		const jetpackContentObj = {
			key: 'jetpack',
			title: translate( 'Jetpack required' ),
			description: (
				<p>
					{ translate(
						'Jetpack will allow WordPress.com to communicate with your self-hosted WordPress site. '
					) }
				</p>
			),
			icon: jetpack,
			actionText: translate( 'Install Jetpack' ),
			value: '',
		};
		const wpcomMigrationContentObj = {
			key: 'wordpress',
			title: translate( 'Move to WordPress.com' ),
			description: (
				<p>
					{ translate(
						'This free plugin offers a simple way to migrate any site to WordPress.com managed hosting.'
					) }
				</p>
			),
			icon: <Gridicon icon="plugins" />,
			actionText: translate( 'Update plugin' ),
			value: '',
		};
		return isMigrateFromWp ? wpcomMigrationContentObj : jetpackContentObj;
	}

	function installJetpack() {
		recordTracksEvent( 'calypso_site_importer_install_jetpack' );
		const source = 'import';
		window.open( `/jetpack/connect/?url=${ sourceSiteUrl }&source=${ source }`, '_blank' );
	}

	function onMigrationPluginUpdate() {
		recordTracksEvent( 'calypso_site_importer_update_wp_migration_plugin' );
		window.open( `${ sourceSiteUrl }/wp-admin/plugins.php`, '_blank' );
	}

	function onActionClick() {
		return isMigrateFromWp ? onMigrationPluginUpdate() : installJetpack();
	}

	function onInstallJetpackManuallyClick() {
		recordTracksEvent( 'calypso_site_importer_install_jetpack_manually' );
		window.open( `https://jetpack.com/support/getting-started-with-jetpack/` );
	}

	return (
		<div className="import__import-everything import__import-everything--redesign">
			<div className="import__heading import__heading-center">
				<Title>{ renderTitle() }</Title>
				<SubTitle>{ renderSubTitle() }</SubTitle>
			</div>
			<div className="select-items-wrapper">
				<SelectItems
					onSelect={ onActionClick }
					items={ [ renderSelectBoxContent() ] }
					preventWidows={ preventWidows }
				/>
			</div>
			{ ! isMigrateFromWp && (
				<div className="import__footer-button-container">
					<Button
						borderless
						className="action-buttons__install-jetpack-manually"
						onClick={ onInstallJetpackManuallyClick }
					>
						{ translate( 'Install Jetpack manually' ) }
					</Button>
				</div>
			) }
		</div>
	);
};
