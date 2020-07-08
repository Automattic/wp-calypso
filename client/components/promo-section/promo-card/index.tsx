/**
 * External dependencies
 */
import React, { FunctionComponent, ReactElement } from 'react';
import { TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import PromoCardCta from './cta';
import classNames from 'classnames';
import Badge from 'components/badge';

/**
 * Style dependencies
 */
import './style.scss';

export interface Image {
	path: string;
	alt?: string | TranslateResult;
	align?: 'left' | 'right';
}

export interface Props {
	image?: Image | ReactElement;
	title: string | TranslateResult;
	isPrimary?: boolean;
	badge?: string;
}

const isImage = ( image: Image | ReactElement ): image is Image => image.hasOwnProperty( 'path' );

const PromoCard: FunctionComponent< Props > = ( { title, image, isPrimary, children, badge } ) => {
	const classes = classNames( {
		'promo-card': true,
		'is-primary': isPrimary,
	} );
	return (
		<ActionPanel className={ classes }>
			{ image && (
				<ActionPanelFigure inlineBodyText={ false } align={ image?.align || 'left' }>
					{ isImage( image ) ? <img src={ image.path } alt={ image.alt } /> : image }
				</ActionPanelFigure>
			) }
			<ActionPanelBody>
				<ActionPanelTitle className={ classNames( { 'is-primary': isPrimary } ) }>
					{ title }
					{ badge && <Badge className="promo-card__title-badge">{ badge }</Badge> }
				</ActionPanelTitle>
				{ isPrimary
					? React.Children.map( children, ( child ) => {
							return child && PromoCardCta === child.type
								? React.cloneElement( child, { isPrimary } )
								: child;
					  } )
					: children }
			</ActionPanelBody>
		</ActionPanel>
	);
};

export default PromoCard;
