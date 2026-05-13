import { isValidElement } from '@wordpress/element';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import type { ReactNode } from 'react';

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
 * Layout follows the card count: 1 card spans the column, 2 cards share a
 * two-up grid, and 3 cards stack the highest-priority card full-width on
 * top with the remaining two side-by-side underneath.
 */
export function FeaturesSection( { cards, className }: FeaturesSectionProps ): JSX.Element | null {
	if ( ! cards || cards.length === 0 ) {
		return null;
	}

	return (
		<div
			className={ clsx(
				'connect-screen-features-section',
				`has-${ cards.length }-card`,
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
