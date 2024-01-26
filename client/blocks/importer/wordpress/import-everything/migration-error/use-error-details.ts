import { MigrationStatusError } from '@automattic/data-stores';
import { createElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useEffect, useState } from 'react';

export default function useErrorDetails(
	status: MigrationStatusError | null,
	sourceSiteUrl: string,
	targetSiteUrl: string
) {
	const translate = useTranslate();

	const [ title, setTitle ] = useState( '' );
	const [ subTitle, setSubTitle ] = useState< string | ReactNode >( '' );
	const [ hintId, setHintId ] = useState( '' );
	const [ goBackCta ] = useState( false );
	const [ getHelpCta, showGetHelpCta ] = useState( false );
	const [ tryAgainCta, showTryAgainCta ] = useState( false );
	const [ importContentCta, showImportContentCta ] = useState( false );

	const titleA = translate( 'We ran into a problem migrating your site' );
	const titleB = translate( "You're one step ahead" );

	const handleDetails = useCallback( () => {
		switch ( status ) {
			case MigrationStatusError.OLD_JETPACK:
				setTitle( titleA );
				setHintId( 'jetpack-update' );
				showTryAgainCta( true );
				showGetHelpCta( true );
				break;

			case MigrationStatusError.FORBIDDEN:
			case MigrationStatusError.GENERIC:
				setTitle( titleA );
				setHintId( 'incompatible-plugins' );
				showTryAgainCta( true );
				showGetHelpCta( true );
				break;

			case MigrationStatusError.SOURCE_SITE_MULTISITE:
				setTitle( titleA );
				setSubTitle(
					translate(
						"Looks like you might have tried to import a multisite WordPress installation, which isn’t currently supported. You could try using the 'Content only' import option instead or reach out for assistance."
					)
				);
				showImportContentCta( true );
				showGetHelpCta( true );
				break;

			case MigrationStatusError.SOURCE_SITE_IS_ATOMIC:
				setTitle( titleB );
				setSubTitle(
					translate(
						'It looks like your {{a}}source site{{/a}}’s already hosted on WordPress.com! You can always reach out to support if you have any questions.',
						{
							components: {
								a: createElement( 'a', { href: `${ sourceSiteUrl }/wp-admin`, target: '_blank' } ),
							},
						}
					)
				);
				showGetHelpCta( true );
				break;

			case MigrationStatusError.SOURCE_SITE_IS_PROTECTED:
				setTitle( titleA );
				setSubTitle(
					translate(
						'Your {{a}}source site{{/a}} is protected. You can always reach out to support if you have any questions.',
						{
							components: {
								a: createElement( 'a', { href: `${ sourceSiteUrl }/wp-admin`, target: '_blank' } ),
							},
						}
					)
				);
				showGetHelpCta( true );
				break;

			case MigrationStatusError.TARGET_SITE_IS_PROTECTED:
				setTitle( titleA );
				setSubTitle(
					translate(
						'Your {{a}}destination site{{/a}} is protected. You can always reach out to support if you have any questions.',
						{
							components: {
								a: createElement( 'a', { href: `${ targetSiteUrl }/wp-admin`, target: '_blank' } ),
							},
						}
					)
				);
				showGetHelpCta( true );
				break;

			case MigrationStatusError.NO_START_USER_ADMIN_ON_SOURCE:
			case MigrationStatusError.NO_START_USER_ADMIN_ON_TARGET:
				setTitle( titleA );
				setHintId( 'administrator-role' );
				showTryAgainCta( true );
				showGetHelpCta( true );
				break;

			case MigrationStatusError.NO_START_SOURCE_IN_PROGRESS:
			case MigrationStatusError.NO_START_TARGET_IN_PROGRESS:
				setTitle( titleA );
				setSubTitle(
					translate(
						'Looks like there’s already an active migration happening with either the {{linkA}}source{{/linkA}} or {{linkB}}destination{{/linkB}} site.{{br}}{{/br}}You’ll be able to try again once the process is completed. You can always reach out to support if you have questions.',
						{
							components: {
								br: createElement( 'br' ),
								linkA: createElement( 'a', {
									href: `${ sourceSiteUrl }/wp-admin/users.php`,
									target: '_blank',
									rel: 'noreferrer',
								} ),
								linkB: createElement( 'a', {
									href: `${ targetSiteUrl }/wp-admin/users.php`,
									target: '_blank',
									rel: 'noreferrer',
								} ),
							},
						}
					)
				);
				showTryAgainCta( true );
				showGetHelpCta( true );
				break;

			case MigrationStatusError.BACKUP_QUEUEING:
				setTitle( titleA );
				setSubTitle(
					translate(
						'Looks like something went wrong. Please reach out to our support team and we’ll get you back up and running.'
					)
				);
				showGetHelpCta( true );
				break;

			case MigrationStatusError.BACKUP_SITE_NOT_ACCESSIBLE:
				setTitle( titleA );
				setHintId( 'backup-fail' );
				showTryAgainCta( true );
				showGetHelpCta( true );
				break;

			case MigrationStatusError.MISSING_SOURCE_MASTER_USER:
				setTitle( titleA );
				setHintId( 'jetpack-connection' );
				showTryAgainCta( true );
				showGetHelpCta( true );
				break;

			case MigrationStatusError.WPCOM_MIGRATION_PLUGIN_INCOMPATIBLE:
				setTitle( titleA );
				setHintId( 'migration-plugin-update' );
				showTryAgainCta( true );
				showGetHelpCta( true );
				break;

			// Miscellaneous
			case MigrationStatusError.GENERAL:
			case MigrationStatusError.UNKNOWN:
			default:
				setTitle( titleA );
				setSubTitle(
					translate(
						'Looks like something went wrong. Please reach out to our support team and we’ll get you back up and running.'
					)
				);
				showGetHelpCta( true );
				break;
		}
	}, [ status ] );

	useEffect( () => {
		handleDetails();
	}, [ handleDetails ] );

	return { title, subTitle, hintId, goBackCta, getHelpCta, tryAgainCta, importContentCta };
}
