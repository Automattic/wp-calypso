import { css } from '@emotion/css';
import classnames from 'classnames';
import { ReactNode } from 'react';
import './style.scss';
import { MShotsOptions, useMshotsImg } from './use-mshots-img';
import { getTextColorFromBackground } from './utils';

export type SizeCss = { width: number; height: number };

const DEFAULT_SIZE = { width: 106, height: 76.55 };

const DEFAULT_CLASSNAME = css( DEFAULT_SIZE );

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
	className = DEFAULT_CLASSNAME,
	alt,
	mShotsUrl = '',
	bgColorImgUrl,
	width = DEFAULT_SIZE.width,
	height = DEFAULT_SIZE.height,
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

	const classes = classnames(
		'site-thumbnail',
		isLoading ? 'site-thumbnail-loading' : 'site-thumbnail-visible',
		className
	);

	const showLoader = mShotsUrl && ! isError;
	const mshotsImgLoaded = imgProps.src && ! isError;

	const blurSize = width > DEFAULT_SIZE.width ? 'medium' : 'small';

	return (
		<div className={ classes } style={ { backgroundColor, color } }>
			{ bgColorImgUrl && ! mshotsImgLoaded && (
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
			{ mshotsImgLoaded && (
				<img
					className={ classnames( 'site-thumbnail__image', {
						'site-thumbnail__mshot_default_hidden': isLoading,
					} ) }
					alt={ alt }
					sizes={ sizesAttr || `${ width }px` }
					{ ...imgProps }
				/>
			) }
		</div>
	);
};
