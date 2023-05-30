import { IMPORT_FOCUSED_FLOW } from '@automattic/onboarding';
import { useEffect, useState } from 'react';

export default function useMigrationConfirmation(): [ boolean, ( value: boolean ) => void ] {
	const KEY = `${ IMPORT_FOCUSED_FLOW }_prompt-confirmed`;

	const [ migrationConfirmed, setMigrationConfirmed ] = useState(
		sessionStorage.getItem( KEY ) === 'true'
	);

	useEffect( () => {
		sessionStorage.setItem( KEY, migrationConfirmed.toString() );
	}, [ migrationConfirmed ] );

	return [ migrationConfirmed, setMigrationConfirmed ];
}
