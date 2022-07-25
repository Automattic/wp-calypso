import classnames from 'classnames';
import { ReactNode } from 'react';
import './style.scss';
import { useMshotsImg } from './use-mshots';
import { getTextColorFromBackground } from './utils';

const MSHOTS_OPTION = {
	vpw: 1200,
	vph: 1200,
	w: 300,
};

type Props = {
	backgroundColor?: string;
	mShotsUrl?: string;
	size?: 'small' | 'medium';
	children?: ReactNode;
};

export const SiteThumbnail = ( {
	backgroundColor,
	children,
	mShotsUrl,
	size = 'small',
}: Props ) => {
	const maybeImage = useMshotsImg( mShotsUrl ?? '', MSHOTS_OPTION );

	const src: string = maybeImage?.src || '';
	const visible = !! src && mShotsUrl;
	const textColor = backgroundColor && getTextColorFromBackground( backgroundColor );

	const className = classnames(
		'site-thumbnail',
		visible ? 'site-thumbnail-visible' : '',
		`site-thumbnail__size-${ size }`
	);

	const loader = mShotsUrl ? 'site-thumbnail-loader' : '';

	return ! visible ? (
		<div className={ className } style={ { backgroundColor: backgroundColor, color: textColor } }>
			<div className={ loader }>{ children }</div>
		</div>
	) : (
		<img className={ className } src={ src } alt="site thumbnail" />
	);
};
