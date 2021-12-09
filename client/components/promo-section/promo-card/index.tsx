import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { TranslateResult } from 'i18n-calypso';
import { Children, cloneElement, FunctionComponent } from 'react';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import Badge from 'calypso/components/badge';
import PromoCardCta from './cta';
import type { ReactElement } from 'react';

import './style.scss';

export interface Image {
	path: string;
	className?: string;
	alt?: string;
	align?: 'left' | 'right';
}

export interface Props {
	icon: string;
	image?: Image | ReactElement;
	title?: string | TranslateResult;
	titleComponent?: ReactElement;
	isPrimary?: boolean;
	badge?: string | ReactElement;
	className?: string;
}

const isImage = ( image: Image | ReactElement ): image is Image => image.hasOwnProperty( 'path' );

const PromoCard: FunctionComponent< Props > = ( {
	title,
	titleComponent,
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

	const badgeComponent = badge ? (
		<Badge className="promo-card__title-badge">{ badge }</Badge>
	) : null;

	return (
		<ActionPanel className={ classes }>
			{ image && (
				<ActionPanelFigure inlineBodyText={ false } align={ image?.align || 'left' }>
					{ isImage( image ) ? (
						<img src={ image.path } alt={ image.alt } className={ image.className } />
					) : (
						image
					) }
				</ActionPanelFigure>
			) }
			{ icon && (
				<ActionPanelFigure inlineBodyText={ false } align="left">
					<Gridicon icon={ icon } size="32" />
				</ActionPanelFigure>
			) }
			<ActionPanelBody>
				{ title && (
					<ActionPanelTitle className={ classNames( { 'is-primary': isPrimary } ) }>
						{ title }
						{ badgeComponent }
					</ActionPanelTitle>
				) }
				{ titleComponent && (
					<>
						{ titleComponent }
						{ badgeComponent }
					</>
				) }
				{ isPrimary
					? Children.map( children, ( child ) => {
							return child && PromoCardCta === child.type
								? cloneElement( child, { isPrimary } )
								: child;
					  } )
					: children }
			</ActionPanelBody>
		</ActionPanel>
	);
};

export default PromoCard;
