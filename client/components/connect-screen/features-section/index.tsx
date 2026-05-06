import { isValidElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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
	/**
	 * Optional logo rendered above the overflow plugin list. Used by the
	 * connector flow's all-three-families scenario to surface the Jetpack
	 * brand mark even when Jetpack doesn't earn one of the two card slots.
	 */
	overflowLogo?: ReactNode;
	overflowItems?: string[];
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
 * Two-up feature blocks used by the unified Jetpack connection flow to show
 * the user *what they'll actually get* once they finish connecting. Each
 * block is a brand-keyed summary (A4A / Woo / Jetpack / individual Jetpack
 * plugin) with a centered logo and a small bullet list — visually flat (no
 * card chrome) so the cards read as part of the surrounding column rather
 * than as separate boxes.
 *
 * The optional `overflowLogo` + `overflowItems` props render a "Used by"
 * stack underneath the cards: a label, an optional brand logo, and the
 * comma-separated plugin display names. Used to surface additional active
 * plugins that didn't earn one of the card slots.
 */
export function FeaturesSection( {
	cards,
	overflowLogo,
	overflowItems,
	className,
}: FeaturesSectionProps ): JSX.Element | null {
	if ( ! cards || cards.length === 0 ) {
		return null;
	}

	const hasOverflow = overflowItems && overflowItems.length > 0;

	return (
		<div
			className={ clsx(
				'connect-screen-features-section',
				`has-${ cards.length }-cards`,
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
									<Icon
										icon={ check }
										size={ 20 }
										className="connect-screen-features-section__card-bullet-icon"
									/>
									<span>{ bullet }</span>
								</li>
							) ) }
						</ul>
					</article>
				) ) }
			</div>
			{ hasOverflow && (
				<div className="connect-screen-features-section__overflow">
					<p className="connect-screen-features-section__overflow-label">{ __( 'Used by' ) }</p>
					{ renderImage( overflowLogo, '', 'connect-screen-features-section__overflow-logo' ) }
					<p className="connect-screen-features-section__overflow-items">
						{ overflowItems.join( ', ' ) }
					</p>
				</div>
			) }
		</div>
	);
}
