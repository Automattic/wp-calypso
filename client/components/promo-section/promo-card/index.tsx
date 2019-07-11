/**
 * External dependencies
 */
import React, { FC, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelTitle from 'components/action-panel/title';

/**
 * Style dependencies
 */
import './style.scss';

interface Image {
	path: string;
	alt?: string;
	align?: 'left' | 'right';
}

interface Props {
	image?: Image;
	title: string;
	children: ReactNode;
}

const PromoCard: FC< Props > = ( { title, image, children } ) => {
	return (
		<Card className="action-panel promo-card">
			{ image && (
				<ActionPanelFigure inlineBodyText={ false } align={ image.align || 'left' }>
					<img src={ image.path } alt={ image.alt } />
				</ActionPanelFigure>
			) }
			<div class="promo-card__body">
				<ActionPanelTitle>{ title }</ActionPanelTitle>
				{ children }
			</div>
		</Card>
	);
};

export default PromoCard;
