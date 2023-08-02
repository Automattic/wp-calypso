import { IMPORT_FOCUSED_FLOW } from '@automattic/onboarding';
import { useEffect, useState } from 'react';

/**
 * Hook to store the migration confirmation in session storage.
 * It returns an array with the current value and a setter.
 * It allows us to know if the user has confirmed the migration prompt,
 * so we don't show it multiple times.
 */
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
