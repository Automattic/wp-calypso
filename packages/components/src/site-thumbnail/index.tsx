import classnames from 'classnames';
import { ReactNode } from 'react';
import './style.scss';
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
	const { isLoading, isError, imgProps } = useMshotsImg( mShotsUrl, mshotsOption );

	const color = backgroundColor && getTextColorFromBackground( backgroundColor );

	const classes = classnames(
		'site-thumbnail',
		className,
		isLoading ? 'site-thumbnail-loading' : 'site-thumbnail-visible',
		`site-thumbnail__size-${ size }`
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
					alt={ alt }
					{ ...imgProps }
				/>
			) }
		</div>
	);
};
