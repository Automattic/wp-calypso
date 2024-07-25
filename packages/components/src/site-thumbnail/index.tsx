import clsx from 'clsx';
import { ReactNode } from 'react';
import './style.scss';
import { MShotsOptions, useMshotsImg } from './use-mshots-img';
import { getTextColorFromBackground } from './utils';

export type SizeCss = { width: number; height: number };

export const DEFAULT_THUMBNAIL_SIZE = { width: 106, height: 76.55 };

const VIEWPORT_BASE = 1200;

type Props = {
	alt: string;
	backgroundColor?: string;
	className?: string;
	mShotsUrl?: string;
	width?: number;
	height?: number;
	dimensionsSrcset?: Array< SizeCss >;
	sizesAttr?: string;
	children?: ReactNode;
	bgColorImgUrl?: string;
	viewport?: number;
	mshotsOption?: MShotsOptions;
};

export const SiteThumbnail = ( {
	backgroundColor,
	children,
	className,
	alt,
	mShotsUrl = '',
	bgColorImgUrl,
	width = DEFAULT_THUMBNAIL_SIZE.width,
	height = DEFAULT_THUMBNAIL_SIZE.height,
	dimensionsSrcset = [],
	sizesAttr = '',
	viewport = VIEWPORT_BASE,
	mshotsOption,
}: Props ) => {
	const options: MShotsOptions = {
		vpw: viewport,
		vph: viewport,
		w: width,
		h: height,
		...mshotsOption,
	};
	const { imgProps, isLoading, isError } = useMshotsImg( mShotsUrl, options, [
		...dimensionsSrcset,
		{ width, height },
	] );

	const color = backgroundColor && getTextColorFromBackground( backgroundColor );

	const classes = clsx(
		'site-thumbnail',
		isLoading ? 'site-thumbnail-loading' : 'site-thumbnail-visible',
		className
	);

	const showLoader = mShotsUrl && ! isError;
	const mshotIsFullyLoaded = imgProps.src && ! isError && ! isLoading;

	const blurSize = width > DEFAULT_THUMBNAIL_SIZE.width ? 'medium' : 'small';

	return (
		<div className={ classes } style={ { backgroundColor, color } }>
			{ !! bgColorImgUrl && ! mshotIsFullyLoaded && (
				<div
					className={ `site-thumbnail__image-bg site-thumbnail__image-blur-${ blurSize }` }
					style={ { backgroundImage: `url(${ bgColorImgUrl })` } }
				></div>
			) }
			{ ( isLoading || isError ) && (
				<div className={ clsx( { 'site-thumbnail-loader': showLoader }, 'site-thumbnail-icon' ) }>
					{ children }
				</div>
			) }
			{ imgProps.src && ! isLoading && ! isError && (
				<img
					className="site-thumbnail__image"
					alt={ alt }
					sizes={ sizesAttr || `${ width }px` }
					{ ...imgProps }
				/>
			) }
		</div>
	);
};
