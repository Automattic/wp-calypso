import NoticeBanner from '@automattic/components/src/notice-banner';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference, setPreference } from 'calypso/state/preferences/actions';
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
	isFullWidth?: boolean;
	allowTemporaryDismissal?: boolean;
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
	isFullWidth = false,
	allowTemporaryDismissal: allowTemporaryDismissalProp = false,
}: Props ) {
	const dispatch = useDispatch();

	const isNarrowView = useBreakpoint( '<960px' );
	const allowTemporaryDismissal = allowTemporaryDismissalProp && isNarrowView;

	const bannerShown = useSelector( ( state ) =>
		preferenceName ? getPreference( state, preferenceName ) : false
	);

	const wrapperClass = clsx( className, 'a4a-layout__banner', {
		'a4a-layout__banner--full-width': isFullWidth,
	} );

	const handleClose = () => {
		if ( preferenceName ) {
			dispatch(
				allowTemporaryDismissal
					? setPreference( preferenceName, true )
					: savePreference( preferenceName, true )
			);
		}
		onClose?.();
	};

	if ( bannerShown ) {
		return null;
	}

	// When allowTemporaryDismissal is true, show close button on narrow viewports
	// (even if hideCloseButton is true) to allow temporary dismissal.
	// On wide viewports, respect the hideCloseButton prop.
	const shouldHideCloseButton = hideCloseButton && ! allowTemporaryDismissal;

	return (
		<div className={ wrapperClass }>
			<NoticeBanner
				level={ level }
				onClose={ handleClose }
				title={ title }
				actions={ actions }
				hideCloseButton={ shouldHideCloseButton }
			>
				{ children }
			</NoticeBanner>
		</div>
	);
}
