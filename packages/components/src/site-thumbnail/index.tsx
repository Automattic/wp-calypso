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
	mShotsUrl?: string;
	size?: 'small' | 'medium';
	children?: ReactNode;
	alt?: string;
	mshotsOption?: MShotsOptions;
};

export const SiteThumbnail = ( {
	backgroundColor,
	children,
	alt,
	mShotsUrl = '',
	size = 'small',
	mshotsOption = MSHOTS_OPTION,
}: Props ) => {
	const { src, isLoading, imgRef } = useMshotsImg( mShotsUrl, mshotsOption );

	const color = backgroundColor && getTextColorFromBackground( backgroundColor );

	const className = classnames(
		'site-thumbnail',
		! isLoading ? 'site-thumbnail-visible' : '',
		`site-thumbnail__size-${ size }`
	);

	const loader = mShotsUrl ? 'site-thumbnail-loader' : '';

	return (
		<div className={ className } style={ { backgroundColor, color } }>
			{ isLoading && <div className={ loader }>{ children }</div> }
			{ src && <img ref={ imgRef } src={ src } alt={ alt } loading="lazy" /> }
		</div>
	);
};
