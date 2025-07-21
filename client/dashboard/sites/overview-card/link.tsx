import { Link } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronRight } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import type { OverviewCardLinkProps } from './types';

export function OverviewCardRouterLinkIcon() {
	return <Icon className="dashboard-overview-card__link-icon" icon={ chevronRight } />;
}

export function OverviewCardExtenalLinkIcon() {
	return (
		<span
			className="dashboard-overview-card__link-icon components-external-link__icon"
			aria-label={
				/* translators: accessibility text */
				__( '(opens in a new tab)' )
			}
		>
			&#8599;
		</span>
	);
}

export default function OverviewCardLink( {
	link,
	tracksId,
	variant,
	isExternal,
	onClick,
	children,
}: OverviewCardLinkProps ) {
	const { recordTracksEvent } = useAnalytics();
	const handleClick = () => {
		onClick?.();

		if ( tracksId ) {
			if ( variant === 'upsell' ) {
				recordTracksEvent( 'calypso_dashboard_upsell_click', {
					feature: tracksId,
					type: 'card',
				} );
			} else {
				recordTracksEvent( 'calypso_dashboard_overview_card_click', {
					type: tracksId,
					variant,
				} );
			}
		}
	};

	if ( isExternal ) {
		return (
			<a
				href={ link }
				className="dashboard-overview-card__link"
				target="_blank"
				rel="noreferrer"
				onClick={ handleClick }
			>
				{ children }
			</a>
		);
	}

	return (
		<Link to={ link } className="dashboard-overview-card__link" onClick={ handleClick }>
			{ children }
		</Link>
	);
}
