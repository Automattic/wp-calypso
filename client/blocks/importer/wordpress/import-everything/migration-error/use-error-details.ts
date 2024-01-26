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
	const [ goBackCta, showGoBackCta ] = useState( false );
	const [ getHelpCta, showGetHelpCta ] = useState( false );
	const [ tryAgainCta, showTryAgainCta ] = useState( false );
	const [ importContentCta, showImportContentCta ] = useState( false );

	const titleA = translate( 'We ran into a problem migrating your site' );
	const titleB = translate( "You're one step ahead" );
	const titleC = translate( "We couldn't complete the migration" );

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
				setTitle( titleB );
				setSubTitle(
					translate( 'Your {{a}}source site{{/a}} is a protected site.', {
						components: {
							a: createElement( 'a', { href: `${ sourceSiteUrl }/wp-admin`, target: '_blank' } ),
						},
					} )
				);
				showGoBackCta( true );
				break;

			case MigrationStatusError.TARGET_SITE_IS_PROTECTED:
				setTitle( titleB );
				setSubTitle(
					translate( 'Your {{a}}destination site{{/a}} is a protected site.', {
						components: {
							a: createElement( 'a', { href: `${ targetSiteUrl }/wp-admin`, target: '_blank' } ),
						},
					} )
				);
				showGoBackCta( true );
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
						'A migration from the source or destination site is still in progress and we can’t start a new one. Please, wait until the migration is finished and try again.'
					)
				);
				showTryAgainCta( true );
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
				setTitle( titleC );
				setHintId( 'backup-fail' );
				showTryAgainCta( true );
				showGetHelpCta( true );
				break;

			case MigrationStatusError.MISSING_SOURCE_MASTER_USER:
				setTitle( titleC );
				setHintId( 'jetpack-connection' );
				showTryAgainCta( true );
				showGetHelpCta( true );
				break;

			// Miscellaneous
			case MigrationStatusError.GENERAL:
			case MigrationStatusError.UNKNOWN:
			default:
				setTitle( titleC );
				setSubTitle(
					translate( 'Please reach out to our support team by clicking the "Get help" button.' )
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
