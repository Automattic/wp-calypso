import AppPasswordItem from 'calypso/me/application-password-item';

export default function AppPasswordsList( { appPasswords = [] } ) {
	if ( ! appPasswords.length ) {
		return null;
	}

	return (
		<div className="application-passwords__active">
			<ul className="application-passwords__list">
				{ appPasswords.map( ( password ) => (
					<AppPasswordItem password={ password } key={ password.ID } />
				) ) }
			</ul>
		</div>
	);
}
