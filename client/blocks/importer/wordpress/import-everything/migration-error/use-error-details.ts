import { MigrationStatusError } from '@automattic/data-stores';
import { createElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useEffect, useState } from 'react';

export default function useErrorDetails( status: MigrationStatusError | null ) {
	const translate = useTranslate();

	const [ title, setTitle ] = useState( '' );
	const [ subTitle, setSubTitle ] = useState< string | ReactNode >( '' );
	const [ hintId, setHintId ] = useState( '' );
	const [ goBackCta, showGoBackCta ] = useState( false );
	const [ getHelpCta, showGetHelpCta ] = useState( false );
	const [ tryAgainCta, showTryAgainCta ] = useState( false );

	const titleA = translate( "We couldn't start the migration" );
	const titleB = translate( "We couldn't migrate your site" );
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
						'Currently, our migration process doesn\'t support multisite WordPress installations.{{br}}{{/br}} As an alternative, please consider using the "Content only" import option.',
						{
							components: { br: createElement( 'br' ) },
						}
					)
				);
				showGoBackCta( true );
				break;

			case MigrationStatusError.SOURCE_SITE_IS_ATOMIC:
				setTitle( titleB );
				setSubTitle( translate( 'Your source site is already on WordPress.com.' ) );
				showGoBackCta( true );
				break;

			case MigrationStatusError.SOURCE_SITE_IS_PROTECTED:
				setTitle( titleB );
				setSubTitle( translate( 'Your source site is a protected site.' ) );
				showGoBackCta( true );
				break;

			case MigrationStatusError.TARGET_SITE_IS_PROTECTED:
				setTitle( titleB );
				setSubTitle( translate( 'Your destination site is a protected site.' ) );
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
					translate( 'Please reach out to our support team by clicking the "Get help" button.' )
				);
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

	return { title, subTitle, hintId, goBackCta, getHelpCta, tryAgainCta };
}
