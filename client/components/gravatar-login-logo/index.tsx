import { gravatarClientData } from 'calypso/state/oauth2-clients/reducer';

import './style.scss';

interface Props {
	iconUrl?: string;
	alt: string;
	isCoBrand?: boolean;
	width?: number;
	height?: number;
}

export default function GravatarLoginLogo( {
	iconUrl,
	alt,
	isCoBrand,
	width = 32,
	height = 32,
}: Props ) {
	return (
		<div className="gravatar-login-logo">
			{ ! iconUrl ? (
				// If no `iconUrl` is provided, use the default Gravatar logo.
				<img
					className="gravatar-login-logo__logo-img"
					src={ gravatarClientData.icon }
					alt={ gravatarClientData.title }
					width={ width }
					height={ height }
				/>
			) : (
				<>
					<img
						className="gravatar-login-logo__logo-img"
						src={ iconUrl }
						alt={ alt }
						width={ width }
						height={ height }
					/>
					{ isCoBrand && (
						<img
							className="gravatar-login-logo__logo-img gravatar-login-logo__logo-img--with-co-brand"
							src="https://gravatar.com/images/grav-logo-with-bg.svg"
							alt="Gravatar"
							width={ width }
							height={ height }
						/>
					) }
				</>
			) }
		</div>
	);
}
