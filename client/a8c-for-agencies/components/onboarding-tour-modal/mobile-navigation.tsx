import clsx from 'clsx';
import { useCallback } from 'react';

type Props = {
	menuItems: {
		id: string;
		label: string;
	}[];
	currentSectionId: string | null;
	setCurrentSectionId: ( sectionId: string ) => void;
};

export default function OnboardingTourModalMobileNavigation( {
	menuItems,
	currentSectionId,
	setCurrentSectionId,
}: Props ) {
	const onSwipe = useCallback(
		( e: React.TouchEvent< HTMLDivElement > ) => {
			// Prevent scrolling while touching navigation
			e.preventDefault();

			// Get touch location
			const touch = e.touches[ 0 ];

			// Get navigation element bounds
			const navBounds = e.currentTarget.getBoundingClientRect();

			// Calculate which button is being touched based on x position
			const buttonWidth = navBounds.width / menuItems.length;
			const touchX = touch.clientX - navBounds.left;
			const buttonIndex = Math.floor( touchX / buttonWidth );

			// Ensure valid index and change section if needed
			if ( buttonIndex >= 0 && buttonIndex < menuItems.length ) {
				const sectionId = menuItems[ buttonIndex ].id;
				if ( sectionId !== currentSectionId ) {
					setCurrentSectionId( sectionId );
				}
			}
		},
		[ currentSectionId, menuItems, setCurrentSectionId ]
	);

	return (
		<div className="onboarding-tour-modal__main-content-footer-navigation-wrapper">
			<div
				className="onboarding-tour-modal__main-content-footer-navigation"
				onTouchMove={ onSwipe }
			>
				{ menuItems.map( ( menuItem ) => (
					<button
						className={ clsx( 'onboarding-tour-modal__main-content-footer-navigation-button', {
							'is-active': menuItem.id === currentSectionId,
						} ) }
						key={ menuItem.id }
						onClick={ () => {
							setCurrentSectionId( menuItem.id );
						} }
						aria-label={ menuItem.label }
					/>
				) ) }
			</div>
		</div>
	);
}
