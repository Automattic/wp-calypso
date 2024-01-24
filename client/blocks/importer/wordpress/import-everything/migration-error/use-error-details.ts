import { MigrationStatusError } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';

export default function useErrorDetails( status: MigrationStatusError | null ) {
	const translate = useTranslate();

	const [ title, setTitle ] = useState( '' );
	const [ subTitle, setSubTitle ] = useState( '' );
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
