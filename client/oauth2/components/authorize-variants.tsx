import Authorize from './authorize';

/**
 * Default OAuth2 authorization variant.
 * Uses horizontal layout without permissions display.
 */
export const AuthorizeDefault = () => (
	<Authorize userCardVariant="horizontal" showPermissions={ false } />
);

/**
 * Studio by WordPress.com variant.
 * Uses horizontal layout with permissions display.
 */
export const AuthorizeStudio = () => (
	<Authorize userCardVariant="horizontal" showPermissions showLogo />
);
