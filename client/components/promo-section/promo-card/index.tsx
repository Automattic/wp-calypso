/**
 * External dependencies
 */
import React, { FunctionComponent, ReactElement } from 'react';
import { TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import ActionPanelBody from 'calypso/components/action-panel/body';
import PromoCardCta from './cta';
import classNames from 'classnames';
import Badge from 'calypso/components/badge';
import Gridicon from 'calypso/components/gridicon';

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
	icon: string;
	image?: Image | ReactElement;
	title: string | TranslateResult;
	isPrimary?: boolean;
	badge?: string;
	className?: string;
}

const isImage = ( image: Image | ReactElement ): image is Image => image.hasOwnProperty( 'path' );

const PromoCard: FunctionComponent< Props > = ( {
	title,
	icon,
	image,
	isPrimary,
	children,
	badge,
	className,
} ) => {
	const classes = classNames(
		{
			'promo-card': true,
			'is-primary': isPrimary,
		},
		className
	);
	return (
		<ActionPanel className={ classes }>
			{ image && (
				<ActionPanelFigure inlineBodyText={ false } align={ image?.align || 'left' }>
					{ isImage( image ) ? <img src={ image.path } alt={ image.alt } /> : image }
				</ActionPanelFigure>
			) }
			{ icon && (
				<ActionPanelFigure inlineBodyText={ false } align="left">
					<Gridicon icon={ icon } size="32" />
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
