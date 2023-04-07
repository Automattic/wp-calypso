import { translate } from 'i18n-calypso';

export const ActiveBadge = () => (
	<span className="theme-card__info-badge theme-card__info-badge-active">
		{ translate( 'Active', {
			context: 'singular noun, the currently active theme',
		} ) }
	</span>
);
