/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelTitle from 'components/action-panel/title';
import PromoCardCta from './cta';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export interface Image {
	path: string;
	alt?: string;
	align?: 'left' | 'right';
}

export interface Props {
	image?: Image;
	title: string;
	isPrimary?: boolean;
}

const PromoCard: FunctionComponent< Props > = ( { title, image, isPrimary, children } ) => {
	const classes = classNames( {
		'action-panel': true,
		'promo-card': true,
		'is-primary': isPrimary,
	} );
	return (
		<Card className={ classes }>
			{ image && (
				<ActionPanelFigure inlineBodyText={ false } align={ image.align || 'left' }>
					<img src={ image.path } alt={ image.alt } />
				</ActionPanelFigure>
			) }
			<div className="promo-card__body">
				<ActionPanelTitle className={ classNames( { 'is-primary': isPrimary } ) }>
					{ title }
				</ActionPanelTitle>
				{ isPrimary
					? React.Children.map( children, child => {
							return child && PromoCardCta === child.type
								? React.cloneElement( child, { isPrimary } )
								: child;
					  } )
					: children }
			</div>
		</Card>
	);
};

export default PromoCard;
