import { Button, MenuItem, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import {
	Children,
	isValidElement,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
	type ReactElement,
} from 'react';
import { useAnalytics } from '../../app/analytics';
import OnboardingTourModalMobileNavigation from './mobile-navigation';
import OnboardingTourModalSection from './section';
import OnboardingTourModalSectionContent from './section-content';
import {
	ONBOARDING_TOUR_HASH,
	type ActionProps,
	type OnboardingTourModalSectionProps,
	type RenderableAction,
	type MenuItemType,
} from './types';

import './style.scss';

export { ONBOARDING_TOUR_HASH };

interface OnboardingTourModalProps {
	onClose: () => void;
	children?: ReactNode;
	/**
	 * Optional tracking event prefix. If provided, tracking events will be recorded.
	 * Events recorded:
	 * - `{trackingPrefix}_section_view` - when a section is viewed
	 * - `{trackingPrefix}_section_menu_item_click` - when a menu item is clicked
	 * - `{trackingPrefix}_section_menu_item_swipe` - when swiping on mobile navigation
	 * - `{trackingPrefix}_close_button_click` - when the close button is clicked
	 */
	trackingPrefix?: string;
}

function OnboardingTourModal( { onClose, children, trackingPrefix }: OnboardingTourModalProps ) {
	const { recordTracksEvent } = useAnalytics();

	const sections: ReactElement< OnboardingTourModalSectionProps >[] = Children.toArray(
		children
	).filter(
		( child: ReactNode ) => isValidElement( child ) && child.type === OnboardingTourModalSection
	) as ReactElement< OnboardingTourModalSectionProps >[];

	const defaultSection = sections.find(
		( section ) => `${ ONBOARDING_TOUR_HASH }-${ section?.props?.id }` === window.location.hash
	);

	const [ currentSectionId, setCurrentSectionId ] = useState(
		defaultSection ? defaultSection.props?.id : sections[ 0 ].props?.id
	);

	const menuItems: MenuItemType[] = useMemo(
		() =>
			sections.map( ( section ) => ( {
				id: section?.props?.id,
				label: section?.props?.title,
			} ) ),
		[ sections ]
	);

	const currentSection = useMemo( () => {
		return sections.find( ( section ) => section?.props?.id === currentSectionId );
	}, [ sections, currentSectionId ] );

	const currentSectionIndex = sections.findIndex(
		( section ) => section?.props?.id === currentSectionId
	);

	const actions = useMemo( () => {
		return currentSection?.props
			?.renderableActions?.( {
				onClose,
				onNext: () => setCurrentSectionId( sections[ currentSectionIndex + 1 ]?.props?.id ),
			} )
			?.map( ( renderableAction: RenderableAction ) => {
				if ( ! renderableAction ) {
					return null;
				}

				if ( isValidElement( renderableAction ) ) {
					return renderableAction;
				}

				const { label, ...restButtonProps } = renderableAction as ActionProps;

				return (
					<Button key={ label } { ...restButtonProps }>
						{ label }
					</Button>
				);
			} );
	}, [ currentSection?.props, onClose, sections, currentSectionIndex ] );

	useEffect( () => {
		if ( currentSection?.props?.id && trackingPrefix ) {
			recordTracksEvent( `${ trackingPrefix }_section_view`, {
				section: currentSection?.props?.id,
			} );
		}
	}, [ currentSection, recordTracksEvent, trackingPrefix ] );

	const handleMenuItemClick = ( menuItem: MenuItemType ) => {
		setCurrentSectionId( menuItem.id );
		window.history.replaceState(
			window.history.state,
			'',
			`${ ONBOARDING_TOUR_HASH }-${ menuItem.id }`
		);
		if ( trackingPrefix ) {
			recordTracksEvent( `${ trackingPrefix }_section_menu_item_click`, {
				section: menuItem.id,
			} );
		}
	};

	const handleMobileNavigationChange = ( sectionId: string ) => {
		setCurrentSectionId( sectionId );
		window.history.replaceState(
			window.history.state,
			'',
			`${ ONBOARDING_TOUR_HASH }-${ sectionId }`
		);
		if ( trackingPrefix ) {
			recordTracksEvent( `${ trackingPrefix }_section_menu_item_swipe`, {
				section: sectionId,
			} );
		}
	};

	const handleClose = () => {
		if ( trackingPrefix ) {
			recordTracksEvent( `${ trackingPrefix }_close_button_click` );
		}
		onClose();
	};

	return (
		<Modal
			className="dashboard-onboarding-tour-modal-wrapper"
			onRequestClose={ onClose }
			__experimentalHideHeader
		>
			<div className="dashboard-onboarding-tour-modal">
				<div className="dashboard-onboarding-tour-modal__aside">
					{ menuItems.map( ( menuItem ) => (
						<MenuItem
							className={ clsx( 'dashboard-onboarding-tour-modal__aside-menu-item', {
								'is-active': menuItem.id === currentSectionId,
							} ) }
							key={ menuItem.id }
							onClick={ () => handleMenuItemClick( menuItem ) }
						>
							{ menuItem.label }
						</MenuItem>
					) ) }
				</div>
				<div className="dashboard-onboarding-tour-modal__main">
					<Button
						className={ clsx( 'dashboard-onboarding-tour-modal__close-button', {
							'is-dark-background': currentSection?.props?.isDarkBanner,
						} ) }
						onClick={ handleClose }
						aria-label={ __( 'Close' ) }
					>
						<Icon size={ 24 } icon={ close } />
					</Button>
					<div className="dashboard-onboarding-tour-modal__main-banner-container">
						{ sections.map( ( section ) => (
							<img
								className={ clsx( 'dashboard-onboarding-tour-modal__main-banner', {
									'is-visible': section.props.id === currentSection?.props.id,
								} ) }
								key={ section.props.id }
								src={ section?.props.bannerImage }
								alt=""
							/>
						) ) }
					</div>
					<div className="dashboard-onboarding-tour-modal__main-content">
						<div
							className="dashboard-onboarding-tour-modal__main-content-body"
							style={ {
								transform: `translateX(-${ currentSectionIndex * 100 }%)`,
							} }
						>
							{ sections }
						</div>
						<div className="dashboard-onboarding-tour-modal__main-content-footer">
							{ actions }

							<OnboardingTourModalMobileNavigation
								menuItems={ menuItems }
								currentSectionId={ currentSectionId }
								setCurrentSectionId={ handleMobileNavigationChange }
							/>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}

OnboardingTourModal.Section = OnboardingTourModalSection;
OnboardingTourModal.SectionContent = OnboardingTourModalSectionContent;

export default OnboardingTourModal;
export { default as useOnboardingTour } from './use-onboarding-tour';
export type {
	ActionProps,
	RenderableAction,
	RenderableActionProps,
	OnboardingTourModalSectionProps,
} from './types';
