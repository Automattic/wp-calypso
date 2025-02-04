import { Notice } from '@wordpress/components';
import { render } from '@wordpress/element';
import { useEffect, useRef, FC, ComponentProps } from 'react';
import useCanvasMode from '../../../hooks/use-canvas-mode';

const SAVE_HUB_SELECTOR = '.edit-site-save-hub';
const SIDEBAR_NOTICE_SELECTOR = 'wpcom-live-preview-sidebar-notice';

const SidebarNotice: FC< {
	noticeProps: ComponentProps< typeof Notice >;
} > = ( { noticeProps } ) => {
	return (
		<Notice className={ SIDEBAR_NOTICE_SELECTOR } { ...noticeProps }>
			{ noticeProps.children }
		</Notice>
	);
};

export const useSidebarNotice = ( {
	noticeProps,
	shouldShowNotice = true,
}: {
	noticeProps: ComponentProps< typeof Notice >;
	shouldShowNotice?: boolean;
} ) => {
	const isRendered = useRef( false );
	const canvasMode = useCanvasMode();

	useEffect( () => {
		if ( ! shouldShowNotice ) {
			return;
		}
		if ( canvasMode !== 'view' ) {
			return;
		}
		if ( isRendered.current ) {
			return;
		}

		const saveHub = document.querySelector( SAVE_HUB_SELECTOR );
		if ( ! saveHub ) {
			return;
		}

		// Insert the notice as a sibling of the save hub instead of as a child,
		// to prevent our notice from breaking the flex styles of the hub.
		const container = saveHub.parentNode;
		const noticeContainer = document.createElement( 'div' );
		noticeContainer.classList.add( `${ SIDEBAR_NOTICE_SELECTOR }-container` );
		if ( container ) {
			container.insertBefore( noticeContainer, saveHub );
		}

		const removeNotice = () => {
			if ( noticeContainer?.parentNode ) {
				noticeContainer.parentNode.removeChild( noticeContainer );
				isRendered.current = false;
			}
		};

		render(
			<SidebarNotice
				noticeProps={ {
					onRemove: removeNotice,
					...noticeProps,
				} }
			/>,
			noticeContainer
		);

		isRendered.current = true;

		return () => {
			removeNotice();
		};
	}, [ canvasMode, isRendered, noticeProps, shouldShowNotice ] );
};
