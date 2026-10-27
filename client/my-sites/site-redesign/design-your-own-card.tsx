import { Card, PremiumBadge } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Icon, wordpress } from '@wordpress/icons';
import { useRedesignEligibility } from './eligibility';

import 'calypso/components/theme-tier/theme-tier-badge/style.scss';
import './card.scss';

export function DesignYourOwnCard() {
	const site = useRedesignEligibility();
	const observeCard = useResizeObserver< HTMLElement >( ( entries ) => {
		const entry = entries[ 0 ];
		if ( entry && entry.contentRect.width > 0 ) {
			( entry.target as HTMLElement ).style.setProperty(
				'--site-redesign-card-width',
				`${ entry.contentRect.width }px`
			);
		}
	} );
	if ( ! site ) {
		return null;
	}
	const redesignUrl = `/site-redesign/${ site.slug }`;
	return (
		<Card tagName="article" className="site-redesign-card" ref={ observeCard }>
			<div className="site-redesign-card__image">
				<div className="site-redesign-card__skeleton" aria-hidden="true">
					<div className="site-redesign-card__logo" />
					<div className="site-redesign-card__nav-first" />
					<div className="site-redesign-card__nav-second" />
					<div className="site-redesign-card__nav-third" />
					<div className="site-redesign-card__nav-button" />
					<div className="site-redesign-card__hero-image" />
					<div className="site-redesign-card__heading-first" />
					<div className="site-redesign-card__heading-second" />
					<div className="site-redesign-card__line-first" />
					<div className="site-redesign-card__line-second" />
					<div className="site-redesign-card__action" />
					<div className="site-redesign-card__column-first" />
					<div className="site-redesign-card__column-second" />
					<div className="site-redesign-card__column-third" />
				</div>
				<Button __next40pxDefaultSize className="site-redesign-card__badge" href={ redesignUrl }>
					<Icon icon={ wordpress } />
					{ __( 'Built with the WordPress Agent' ) }
				</Button>
			</div>
			<div className="site-redesign-card__details">
				<a className="site-redesign-card__title" href={ redesignUrl }>
					{ __( 'Design Your Own' ) }
				</a>
				<div className="theme-tier-badge">
					<PremiumBadge
						className="site-redesign-card__availability theme-tier-badge__content theme-tier-badge__without-background"
						labelText={ __( 'Available on Personal' ) }
						shouldHideTooltip
						focusOnShow={ false }
						isClickable={ false }
					/>
				</div>
			</div>
		</Card>
	);
}
