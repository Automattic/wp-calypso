import { isValidElement } from '@wordpress/element';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import type { ReactNode, JSX } from 'react';

import './style.scss';

export interface FeatureCard {
	id: string;
	logo?: string | ReactNode;
	logoAlt?: string;
	/**
	 * Plugin / family display name. Not rendered visually — used as the
	 * card's accessible label so screen readers announce a sensible name
	 * even though the title text was removed from the visual layout.
	 */
	title: string;
	bullets: ReactNode[];
}

export interface FeaturesSectionProps {
	cards: FeatureCard[];
	className?: string;
	/**
	 * When true, the first card is rendered as a full-width hero on its
	 * own row, with every remaining card stacked beneath it (each on its
	 * own row). Default layout otherwise: 1 card spans the column, 2
	 * cards share a side-by-side 2-up grid, 3 cards stack the first card
	 * full-width with the other two sharing the row below.
	 *
	 * Used by the connector flow when the A4A card is present, so the
	 * agency-context card is visually anchored even when only one
	 * supporting card joins it (which would otherwise put A4A in a
	 * shoulder-to-shoulder 2-up grid). Has no visual effect when only one
	 * card is rendered — there is no second row for the supporting
	 * card(s) to stand alone in.
	 */
	heroFirstCard?: boolean;
}

function renderImage( logo: ReactNode | string, logoAlt = '', wrapperClass: string ): ReactNode {
	if ( ! logo ) {
		return null;
	}

	if ( isValidElement( logo ) ) {
		return <div className={ wrapperClass }>{ logo }</div>;
	}

	if ( typeof logo === 'string' ) {
		return (
			<div className={ wrapperClass }>
				<img src={ logo } alt={ logoAlt } />
			</div>
		);
	}

	return null;
}

/**
 * Brand-keyed feature blocks used by the unified Jetpack connection flow
 * to show the user *what they'll actually get* once they finish connecting.
 * Each block is a brand-keyed summary (A4A / Woo / Jetpack / individual
 * Jetpack plugin) with a centered logo and a small bullet list — visually
 * flat (no card chrome) so the cards read as part of the surrounding
 * column rather than as separate boxes.
 *
 * Layout follows the card count by default: 1 card spans the column, 2
 * cards share a two-up grid, and 3 cards stack the highest-priority card
 * full-width on top with the remaining two side-by-side underneath. The
 * optional `heroFirstCard` prop opts the 2-card layout into the same
 * full-width hero treatment used by the 3-card layout so the first card
 * always claims its own row when needed (see prop docs).
 */
export function FeaturesSection( {
	cards,
	className,
	heroFirstCard,
}: FeaturesSectionProps ): JSX.Element | null {
	if ( ! cards || cards.length === 0 ) {
		return null;
	}

	return (
		<div
			className={ clsx(
				'connect-screen-features-section',
				`has-${ cards.length }-card`,
				heroFirstCard && cards.length > 1 && 'has-hero-card',
				className
			) }
		>
			<div className="connect-screen-features-section__cards">
				{ cards.map( ( card ) => (
					<article
						key={ card.id }
						className="connect-screen-features-section__card"
						aria-label={ card.title }
					>
						{ renderImage(
							card.logo,
							card.logoAlt || card.title,
							'connect-screen-features-section__card-logo'
						) }
						<ul className="connect-screen-features-section__card-bullets">
							{ card.bullets.map( ( bullet, index ) => (
								<li key={ index } className="connect-screen-features-section__card-bullet">
									<span aria-hidden="true">
										<Icon
											icon={ check }
											size={ 20 }
											className="connect-screen-features-section__card-bullet-icon"
										/>
									</span>
									<span>{ bullet }</span>
								</li>
							) ) }
						</ul>
					</article>
				) ) }
			</div>
		</div>
	);
}
