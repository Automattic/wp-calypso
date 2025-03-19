import { useEffect, useState } from 'react';

// Does the key even matter, since it's used by more than one flow?
const KEY = 'stepper_import_prompt-confirmed';

/**
 * Hook to store the migration confirmation in session storage.
 * It returns an array with the current value and a setter.
 * It allows us to know if the user has confirmed the migration prompt,
 * so we don't show it multiple times.
 */
export default function useMigrationConfirmation(): [ boolean, ( value: boolean ) => void ] {
	const [ migrationConfirmed, setMigrationConfirmed ] = useState(
		sessionStorage.getItem( KEY ) === 'true'
	);

	useEffect( () => {
		sessionStorage.setItem( KEY, migrationConfirmed.toString() );
	}, [ migrationConfirmed ] );

	return [ migrationConfirmed, setMigrationConfirmed ];
}
