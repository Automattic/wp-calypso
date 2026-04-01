import page from '@automattic/calypso-router';
import { ProfileData } from '@gravatar-com/hovercards';
import AutoDirection from 'calypso/components/auto-direction';

function getFallbackAvatarUrl( { avatarUrl }: { avatarUrl?: string } ): string {
	const defaultUrl = 'https://www.gravatar.com/avatar/0?d=mm&s=256&r=G';
	if ( ! avatarUrl ) {
		return defaultUrl;
	}

	try {
		const url = new URL( avatarUrl );
		url.searchParams.set( 'd', 'mm' );
		url.searchParams.set( 'r', 'G' );
		url.searchParams.set( 's', '256' );
		return url.toString();
	} catch {
		return defaultUrl;
	}
}

interface GravatarHeaderProps {
	gravatarData: Partial< ProfileData >;
	processedAvatarUrl?: string | null;
	userLogin?: string;
	closeCard: () => void;
}

function GravatarHeader( {
	gravatarData,
	processedAvatarUrl,
	userLogin,
	closeCard,
}: GravatarHeaderProps ): JSX.Element {
	const profileUrl = userLogin ? `/reader/users/${ userLogin }` : gravatarData.profileUrl!;

	// We prefer the processedAvatarUrl from the gravatar hovercard itself, as they have logic to
	// evaluate data and set params on the url. However, lets also provide a basic fallback being
	// the avatarUrl from the gavatarData and set some basic params we know we want in this context
	// (default avatar, rating, and size).
	const fallbackAvatarUrl = getFallbackAvatarUrl( gravatarData );

	const clickProfileLink = ( e: React.MouseEvent< HTMLAnchorElement > ) => {
		e.preventDefault();
		closeCard();
		page( profileUrl );
	};

	return (
		<AutoDirection>
			{ /* Note AutoDirection needs a single child to work recursively, hence the fragments. */ }
			<>
				<a
					className="gravatar-hovercard__avatar-link"
					href={ profileUrl }
					onClick={ clickProfileLink }
				>
					<img
						className="gravatar-hovercard__avatar"
						src={ processedAvatarUrl || fallbackAvatarUrl }
						alt={ gravatarData.displayName }
						width={ 104 }
						height={ 104 }
					/>
				</a>

				<a
					className="gravatar-hovercard__name-link"
					href={ profileUrl }
					onClick={ clickProfileLink }
				>
					<h4 className="gravatar-hovercard__name">{ gravatarData.displayName }</h4>
				</a>

				<p className="gravatar-hovercard__description">{ gravatarData.description }</p>
			</>
		</AutoDirection>
	);
}

export default GravatarHeader;
