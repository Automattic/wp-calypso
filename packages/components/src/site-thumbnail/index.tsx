import { css, CSSObject } from '@emotion/css';
import classnames from 'classnames';
import { ReactNode } from 'react';
import './style.scss';
import { MShotsOptions, useMshotsImg } from './use-mshots-img';
import { getTextColorFromBackground } from './utils';

export type SizeCss = { width: number; height: number };
const ASPECT_RATIO = 16 / 11;
export const SITE_THUMBNAIL_DIMENSIONS = {
	small: {
		width: 106,
		height: 76.55,
	},
	medium: {
		width: 401,
		height: 401 / ASPECT_RATIO,
	},
} as const;

const VIEWPORT_BASE = 1200;

type Props = {
	backgroundColor?: string;
	style?: CSSObject;
	mShotsUrl?: string;
	dimension?: SizeCss;
	dimensionsSrcset?: Array< SizeCss >;
	sizesAttr?: string;
	children?: ReactNode;
	alt?: string;
	bgColorImgUrl?: string;
	viewport?: number;
	mshotsOption?: MShotsOptions;
};

export const SiteThumbnail = ( {
	backgroundColor,
	children,
	style,
	alt,
	mShotsUrl = '',
	bgColorImgUrl,
	dimension = SITE_THUMBNAIL_DIMENSIONS.small,
	dimensionsSrcset = [],
	sizesAttr = '',
	viewport = VIEWPORT_BASE,
	mshotsOption,
}: Props ) => {
	const options: MShotsOptions = {
		vpw: viewport,
		vph: viewport,
		w: dimension.width,
		h: dimension.height,
		...mshotsOption,
	};
	const { imgProps, isLoading, isError, imgRef } = useMshotsImg( mShotsUrl, options, [
		...dimensionsSrcset,
		dimension,
	] );

	const color = backgroundColor && getTextColorFromBackground( backgroundColor );

	const classes = classnames(
		'site-thumbnail',
		isLoading ? 'site-thumbnail-loading' : 'site-thumbnail-visible',
		// default image width, height given by dimension if not specified in style
		css( dimension, style )
	);

	const showLoader = mShotsUrl && ! isError;

	const blurSize = dimension.width >= SITE_THUMBNAIL_DIMENSIONS.medium.width ? 'large' : 'small';

	return (
		<div className={ classes } style={ { backgroundColor, color } }>
			{ bgColorImgUrl && (
				<div
					className={ `site-thumbnail__image-bg site-thumbnail__image-blur-${ blurSize }` }
					style={ { backgroundImage: `url(${ bgColorImgUrl })` } }
				></div>
			) }
			{ isLoading && (
				<div
					className={ classnames( { 'site-thumbnail-loader': showLoader }, 'site-thumbnail-icon' ) }
				>
					{ children }
				</div>
			) }
			{ imgProps.src && ! isError && (
				<img
					className={ classnames( 'site-thumbnail__image', {
						'site-thumbnail__mshot_default_hidden': isLoading,
					} ) }
					ref={ imgRef }
					alt={ alt }
					sizes={ sizesAttr || `${ dimension.width }px` }
					{ ...imgProps }
				/>
			) }
		</div>
	);
};
