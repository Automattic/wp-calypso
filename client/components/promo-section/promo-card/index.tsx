import { Badge, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { TranslateResult } from 'i18n-calypso';
import { Children, cloneElement, FunctionComponent, isValidElement } from 'react';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import PromoCardCta from './cta';
import type { ReactElement } from 'react';

import './style.scss';

export interface Image {
	path: string;
	className?: string;
	alt?: string;
	align?: 'left' | 'right';
}

export enum TitleLocation {
	BODY,
	FIGURE,
}

export enum PromoCardVariation {
	Compact = 'compact',
	Default = 'default',
}

export interface Props {
	icon?: string;
	image?: Image | ReactElement;
	title?: string | TranslateResult;
	titleComponent?: ReactElement;
	titleComponentLocation?: TitleLocation;
	isPrimary?: boolean;
	badge?: string | ReactElement;
	className?: string;
	children?: React.ReactNode;
	variation?: PromoCardVariation;
}

const isImage = ( image: Image | ReactElement ): image is Image => image.hasOwnProperty( 'path' );

const PromoCard: FunctionComponent< Props > = ( {
	title,
	titleComponent,
	titleComponentLocation = TitleLocation.BODY,
	icon,
	image,
	isPrimary,
	children,
	badge,
	className,
	variation = PromoCardVariation.Default,
} ) => {
	const isCompact = variation === PromoCardVariation.Compact;

	const classes = clsx(
		{
			'promo-card': true,
			'is-primary': isPrimary,
			compact: isCompact,
		},
		className
	);

	const badgeComponent = badge ? (
		<Badge className="promo-card__title-badge">{ badge }</Badge>
	) : null;

	const titleComponentHeader = titleComponent && (
		<>
			{ titleComponent }
			{ badgeComponent }
		</>
	);

	const imageActionPanelAlignment = image && 'align' in image && image.align ? image.align : 'left';
	/* eslint-disable wpcalypso/jsx-gridicon-size */

	return (
		<ActionPanel className={ classes }>
			{ image && ! isCompact && (
				<ActionPanelFigure inlineBodyText={ false } align={ imageActionPanelAlignment }>
					{ isImage( image ) ? (
						<img src={ image.path } alt={ image.alt || '' } className={ image.className } />
					) : (
						image
					) }
					{ titleComponentLocation === TitleLocation.FIGURE && titleComponentHeader }
				</ActionPanelFigure>
			) }
			{ icon && ! isCompact && (
				<ActionPanelFigure inlineBodyText={ false } align="left">
					<Gridicon icon={ icon } size={ 32 } />
					{ titleComponentLocation === TitleLocation.FIGURE && titleComponentHeader }
				</ActionPanelFigure>
			) }
			<ActionPanelBody>
				{ title && (
					<ActionPanelTitle className={ clsx( { 'is-primary': isPrimary } ) }>
						{ icon && isCompact && <Gridicon icon={ icon } size={ 32 } /> }
						{ title }
						{ badgeComponent }
					</ActionPanelTitle>
				) }
				{ titleComponentLocation === TitleLocation.BODY && titleComponentHeader }
				{ isPrimary
					? Children.map( children, ( child ) => {
							if ( ! child || ! isValidElement< { isPrimary?: boolean } >( child ) ) {
								return child;
							}
							return PromoCardCta === child.type ? cloneElement( child, { isPrimary } ) : child;
					  } )
					: children }
			</ActionPanelBody>
		</ActionPanel>
	);
	/* eslint-enable */
};

export default PromoCard;
