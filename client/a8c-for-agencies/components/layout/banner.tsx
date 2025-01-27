import NoticeBanner from '@automattic/components/src/notice-banner';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './style.scss';

type Props = {
	actions?: React.ReactNode[];
	className?: string;
	children: ReactNode;
	level: 'error' | 'warning' | 'info' | 'success';
	onClose?: () => void;
	title?: string;
	preferenceName?: string;
	hideCloseButton?: boolean;
};

export default function LayoutBanner( {
	className,
	children,
	onClose,
	title,
	actions,
	level = 'success',
	preferenceName,
	hideCloseButton = false,
}: Props ) {
	const dispatch = useDispatch();

	const bannerShown = useSelector( ( state ) =>
		preferenceName ? getPreference( state, preferenceName ) : false
	);

	const wrapperClass = clsx( className, 'a4a-layout__banner' );

	const handleClose = () => {
		if ( preferenceName ) {
			dispatch( savePreference( preferenceName, true ) );
		}
		onClose?.();
	};

	if ( bannerShown ) {
		return null;
	}

	return (
		<div className={ wrapperClass }>
			<NoticeBanner
				level={ level }
				onClose={ handleClose }
				title={ title }
				actions={ actions }
				hideCloseButton={ hideCloseButton }
			>
				{ children }
			</NoticeBanner>
		</div>
	);
}
