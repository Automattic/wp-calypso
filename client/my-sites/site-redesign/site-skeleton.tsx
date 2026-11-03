import clsx from 'clsx';

import './card.scss';

// A wireframe of a site's front page, scaled to whatever box it fills.
export function SiteSkeleton( { className }: { className?: string } ) {
	return (
		<div className={ clsx( 'site-redesign-card__skeleton', className ) } aria-hidden="true">
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
	);
}
