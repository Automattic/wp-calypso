import { css, CSSObject } from '@emotion/css';
import classnames from 'classnames';
import { ReactNode } from 'react';
import './style.scss';
import { MShotsOptions, useMshotsImg } from './use-mshots-img';
import { getTextColorFromBackground } from './utils';

type SizeCss = CSSObject & { width: number; height: number; sizes?: string };
const ASPECT_RATIO = 16 / 11;
const SIZES: { [ sizeName: string ]: SizeCss } = {
	small: {
		width: 108,
		height: 78,
	},
	medium: {
		width: 401,
		height: 401 / ASPECT_RATIO,
		sizes: [
			'(min-width: 1400px) 401px',
			'(min-width: 960px) calc(33vw - 48px)',
			'(min-width: 660px) calc(50vw - 48px)',
			'calc(100vw - 32px)',
		].join( ', ' ),
	},
};

const VIEWPORT_BASE = 1200;

type Props = {
	backgroundColor?: string;
	style?: CSSObject;
	mShotsUrl?: string;
	size?: 'small' | 'medium';
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
	size = 'small',
	viewport = VIEWPORT_BASE,
	mshotsOption,
}: Props ) => {
	const imageSize = SIZES[ size ];
	const options: MShotsOptions = {
		vpw: viewport,
		vph: viewport,
		w: imageSize.width,
		h: imageSize.height,
		...mshotsOption,
	};
	const sizesSrcSet = Object.values( SIZES );
	const { imgProps, isLoading, isError, imgRef } = useMshotsImg( mShotsUrl, options, sizesSrcSet );

	const color = backgroundColor && getTextColorFromBackground( backgroundColor );

	const classes = classnames(
		'site-thumbnail',
		isLoading ? 'site-thumbnail-loading' : 'site-thumbnail-visible',
		css( imageSize, style )
	);

	const showLoader = mShotsUrl && ! isError;

	return (
		<div className={ classes } style={ { backgroundColor, color } }>
			{ bgColorImgUrl && (
				<div
					className={ `site-thumbnail__image-bg site-thumbnail__image-blur-${ size }` }
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
					{ ...imgProps }
					sizes={ imageSize.sizes || `${ imageSize.width }px` }
				/>
			) }
		</div>
	);
};
