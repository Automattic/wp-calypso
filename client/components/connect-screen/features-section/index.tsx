import { isValidElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export interface FeatureCard {
	id: string;
	logo?: string | ReactNode;
	logoAlt?: string;
	title: ReactNode;
	bullets: ReactNode[];
}

export interface FeaturesSectionProps {
	cards: FeatureCard[];
	overflowItems?: string[];
	className?: string;
}

function renderLogo( logo: FeatureCard[ 'logo' ], logoAlt = '' ): ReactNode {
	if ( ! logo ) {
		return null;
	}

	if ( isValidElement( logo ) ) {
		return <div className="connect-screen-features-section__card-logo">{ logo }</div>;
	}

	if ( typeof logo === 'string' ) {
		return (
			<div className="connect-screen-features-section__card-logo">
				<img src={ logo } alt={ logoAlt } />
			</div>
		);
	}

	return null;
}

/**
 * Two-up feature cards used by the unified Jetpack connection flow to show
 * the user *what they'll actually get* once they finish connecting. Each
 * card is a brand-keyed summary (A4A / Woo / Jetpack / individual Jetpack
 * plugin) with a logo, a one-line title, and a small bullet list.
 *
 * The optional `overflowItems` prop renders an "Also used by" comma-list
 * underneath the cards — used to surface additional active plugins that
 * didn't earn their own card slot.
 * @example
 * <FeaturesSection
 *   cards={[
 *     { id: 'jetpack', logo: <JetpackLogo full />, title: 'Jetpack', bullets: ['…', '…'] },
 *     { id: 'woo', logo: '/woo.svg', logoAlt: 'WooCommerce', title: 'WooCommerce', bullets: ['…'] },
 *   ]}
 *   overflowItems={ [ 'Jetpack Boost', 'Jetpack Search' ] }
 * />
 */
export function FeaturesSection( {
	cards,
	overflowItems,
	className,
}: FeaturesSectionProps ): JSX.Element | null {
	if ( ! cards || cards.length === 0 ) {
		return null;
	}

	const hasOverflow = overflowItems && overflowItems.length > 0;
	const overflowLabel = hasOverflow
		? sprintf(
				/* translators: %s is a comma-separated list of plugin display names. */
				__( 'Also used by: %s' ),
				overflowItems.join( ', ' )
		  )
		: null;

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
					<article key={ card.id } className="connect-screen-features-section__card">
						{ renderLogo( card.logo, card.logoAlt ) }
						<h3 className="connect-screen-features-section__card-title">{ card.title }</h3>
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
			{ overflowLabel && (
				<p className="connect-screen-features-section__overflow">{ overflowLabel }</p>
			) }
		</div>
	);
}
