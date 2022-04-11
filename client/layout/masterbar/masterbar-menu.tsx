import page from 'page';
import { useEffect, useState } from 'react';
import type { ReactNode, FC } from 'react';

export const MasterBarMobileMenu: FC< {
	children: ReactNode;
	open: boolean;
	onClose: () => void;
} > = ( { children, open, onClose } ) => {
	const currentURL = page.current;

	const [ openingURL, setOpeningUrl ] = useState( currentURL );

	// record the URL when the menu was open
	useEffect( () => {
		if ( open ) {
			setOpeningUrl( currentURL );
		}
	}, [ open, currentURL ] );

	// if the URL changes, close the menu
	useEffect( () => {
		if ( open && currentURL !== openingURL ) {
			onClose();
		}
	}, [ open, onClose, openingURL, currentURL ] );

	if ( ! open ) {
		return null;
	}

	return (
		<div
			className="masterbar__mobile-menu-backdrop"
			aria-hidden="true"
			onClick={ ( e ) => {
				// don't call onClose if a child is clicked
				if ( e.target === e.currentTarget ) {
					onClose();
				}
			} }
		>
			<div className="masterbar__mobile-menu-inner">{ children }</div>
		</div>
	);
};
