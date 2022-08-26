import { css, CSSObject } from '@emotion/css';
import classnames from 'classnames';
import { ReactNode } from 'react';
import './style.scss';
import { MShotsOptions, useMshotsImg } from './use-mshots-img';
import { getTextColorFromBackground } from './utils';

type SizeCss = CSSObject & { width: number; height: number };
const SIZES: { [ sizeName: string ]: SizeCss } = {
	small: {
		width: 108,
		height: 78,
	},
	medium: {
		width: 374,
		height: 374 * ( 11 / 16 ),
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
				/>
			) }
		</div>
	);
};
