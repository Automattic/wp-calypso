import {
	Button,
	MenuItem,
	Modal,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import { Children, isValidElement, useMemo, type ReactNode, type ReactElement } from 'react';
import OnboardingTourModalMobileNavigation from './mobile-navigation';
import OnboardingTourModalSection from './section';
import OnboardingTourModalSectionContent from './section-content';
import type {
	ActionProps,
	OnboardingTourModalSectionProps,
	RenderableAction,
	MenuItemType,
} from './types';

import './style.scss';

interface OnboardingTourModalProps {
	onClose: () => void;
	children?: ReactNode;
	/**
	 * Callback when the current section changes.
	 * Consumer should update currentSectionId in response.
	 */
	onSectionChange: ( sectionId: string ) => void;
	/**
	 * Current section ID. Consumer manages this state.
	 */
	currentSectionId: string;
}

function OnboardingTourModal( {
	onClose,
	children,
	onSectionChange,
	currentSectionId,
}: OnboardingTourModalProps ) {
	const sections: ReactElement< OnboardingTourModalSectionProps >[] = Children.toArray(
		children
	).filter(
		( child: ReactNode ) => isValidElement( child ) && child.type === OnboardingTourModalSection
	) as ReactElement< OnboardingTourModalSectionProps >[];

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
				onNext: () => onSectionChange( sections[ currentSectionIndex + 1 ]?.props?.id ),
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ currentSection?.props, onClose, sections, currentSectionIndex ] );

	return (
		<Modal
			className="dashboard-onboarding-tour-modal-wrapper"
			onRequestClose={ onClose }
			__experimentalHideHeader
		>
			<HStack className="dashboard-onboarding-tour-modal" alignment="top">
				<VStack className="dashboard-onboarding-tour-modal__aside" spacing={ 1 }>
					{ menuItems.map( ( menuItem ) => (
						<MenuItem
							className={ clsx( 'dashboard-onboarding-tour-modal__aside-menu-item', {
								'is-active': menuItem.id === currentSectionId,
							} ) }
							key={ menuItem.id }
							onClick={ () => onSectionChange( menuItem.id ) }
						>
							{ menuItem.label }
						</MenuItem>
					) ) }
				</VStack>
				<VStack className="dashboard-onboarding-tour-modal__main">
					<Button
						className={ clsx( 'dashboard-onboarding-tour-modal__close-button', {
							'is-dark-background': currentSection?.props?.isDarkBanner,
						} ) }
						onClick={ onClose }
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
					<VStack className="dashboard-onboarding-tour-modal__main-content">
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
								setCurrentSectionId={ onSectionChange }
							/>
						</div>
					</VStack>
				</VStack>
			</HStack>
		</Modal>
	);
}

OnboardingTourModal.Section = OnboardingTourModalSection;
OnboardingTourModal.SectionContent = OnboardingTourModalSectionContent;

export default OnboardingTourModal;
export type {
	ActionProps,
	RenderableAction,
	RenderableActionProps,
	OnboardingTourModalSectionProps,
} from './types';
