import { useRouter } from '@tanstack/react-router';
import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Sidebar from './sidebar';

import './style.scss';

export default function ResponsiveSidebar( {
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
} ) {
	const router = useRouter();
	const isDesktop = useViewportMatch( 'medium' );

	const handleOverlayClick = () => {
		onClose();
	};

	const handleOverlayKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Escape' ) {
			onClose();
		}
	};

	// Close sidebar after the navigation.
	useEffect( () => {
		if ( isDesktop ) {
			return () => {};
		}

		const unsubscribe = router.subscribe( 'onLoad', () => {
			onClose();
		} );

		return () => {
			unsubscribe();
		};
	}, [ isDesktop, router, onClose ] );

	if ( isDesktop ) {
		return <Sidebar />;
	}

	return (
		<div className={ clsx( 'dashboard-responsive-sidebar', { 'is-open': isOpen } ) }>
			{ isOpen &&
				createPortal(
					// eslint-disable-next-line jsx-a11y/no-static-element-interactions
					<div
						role="presentation"
						className="dashboard-responsive-sidebar__overlay"
						onClick={ handleOverlayClick }
						onKeyDown={ handleOverlayKeyDown }
					/>,
					document.body
				) }
			<Sidebar />
		</div>
	);
}
