import './connection-reauth-tag.scss';

interface ConnectionReauthTagProps {
	connectionId: number;
	useAuthStatus: ( connectionId: number ) => { needsReauth?: boolean };
	label: string;
}

export function ConnectionReauthTag( {
	connectionId,
	useAuthStatus,
	label,
}: ConnectionReauthTagProps ) {
	const { needsReauth } = useAuthStatus( connectionId );

	if ( needsReauth !== true ) {
		return null;
	}

	return (
		<span className="connection-reauth-tag" role="status" aria-live="polite">
			{ label }
		</span>
	);
}
