import classnames from 'classnames';
import { ReactNode } from 'react';
import './style.scss';
import useDominantColor from './use-dominant-color';
import { MShotsOptions, useMshotsImg } from './use-mshots-img';
import { getTextColorFromBackground } from './utils';

const MSHOTS_OPTION: MShotsOptions = {
	vpw: 1200,
	vph: 1200,
	w: 374 * 2,
};

type Props = {
	backgroundColor?: string;
	className?: string;
	mShotsUrl?: string;
	size?: 'small' | 'medium';
	children?: ReactNode;
	alt?: string;
	bgColorImgUrl?: string;
	mshotsOption?: MShotsOptions;
};

export const SiteThumbnail = ( {
	backgroundColor,
	children,
	className,
	alt,
	mShotsUrl = '',
	bgColorImgUrl,
	size = 'small',
	mshotsOption = MSHOTS_OPTION,
}: Props ) => {
	const { src, isLoading, isError, imgRef } = useMshotsImg( mShotsUrl, mshotsOption );

	const primary = useDominantColor( bgColorImgUrl );

	const thumbnailBackground = primary?.hexa || backgroundColor;

	const color = thumbnailBackground && getTextColorFromBackground( thumbnailBackground );

	const classes = classnames(
		'site-thumbnail',
		className,
		isLoading ? 'site-thumbnail-loading' : 'site-thumbnail-visible',
		`site-thumbnail__size-${ size }`
	);

	const loader = mShotsUrl && ! isError ? 'site-thumbnail-loader' : '';

	return (
		<div className={ classes } style={ { backgroundColor: thumbnailBackground, color } }>
			{ isLoading && <div className={ loader }>{ children }</div> }
			{ src && ! isError && (
				<img
					className="site-thumbnail__image"
					ref={ imgRef }
					src={ src }
					alt={ alt }
					loading="lazy"
				/>
			) }
		</div>
	);
};
