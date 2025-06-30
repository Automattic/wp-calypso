import page from '@automattic/calypso-router';

function GravatarHeader( { gravatarData, userLogin } ) {
	const profileUrl = userLogin ? `/reader/users/${ userLogin }` : gravatarData.profileUrl;

	const clickProfileLink = ( e ) => {
		e.preventDefault();
		page( profileUrl );
	};

	return (
		<div className="gravatar-hovercard__header">
			<a
				className="gravatar-hovercard__avatar-link"
				href={ profileUrl }
				onClick={ clickProfileLink }
			>
				<img
					className="gravatar-hovercard__avatar"
					src={ gravatarData.avatarUrl }
					alt={ gravatarData.displayName }
					width={ 104 }
					height={ 104 }
				/>
			</a>

			<a className="gravatar-hovercard__name-link" href={ profileUrl } onClick={ clickProfileLink }>
				<h4 className="gravatar-hovercard__name">{ gravatarData.displayName }</h4>
			</a>

			<p className="gravatar-hovercard__description">{ gravatarData.description }</p>
		</div>
	);
}

export default GravatarHeader;
