import { Button, MenuItem, Modal } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import {
	Children,
	isValidElement,
	ReactNode,
	ReactElement,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { ONBOARDING_TOUR_HASH } from '../hoc/with-onboarding-tour/hooks/use-onboarding-tour';
import OnboardingTourModalMobileNavigation from './mobile-navigation';
import OnboardingTourModalSection, {
	ActionProps,
	OnboardingTourModalSectionProps,
	RenderableAction,
} from './section';
import OnboardingTourModalSectionContent from './section-content';

import './style.scss';

interface OnboardingTourModalProps {
	onClose: () => void;
	children?: ReactNode;
}

function OnboardingTourModal( { onClose, children }: OnboardingTourModalProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

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

	const menuItems = useMemo(
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
		if ( currentSection?.props?.id ) {
			dispatch(
				recordTracksEvent( 'calypso_onboarding_tour_modal_section_view', {
					section: currentSection?.props?.id,
				} )
			);
		}
	}, [ currentSection, dispatch ] );

	return (
		<Modal
			className="onboarding-tour-modal-wrapper"
			onRequestClose={ onClose }
			__experimentalHideHeader
		>
			<div className="onboarding-tour-modal">
				<div className="onboarding-tour-modal__aside">
					{ menuItems.map( ( menuItem ) => (
						<MenuItem
							className={ clsx( 'onboarding-tour-modal__aside-menu-item', {
								'is-active': menuItem.id === currentSectionId,
							} ) }
							key={ menuItem.id }
							onClick={ () => {
								setCurrentSectionId( menuItem.id );
								window.history.replaceState(
									window.history.state,
									'',
									`${ ONBOARDING_TOUR_HASH }-${ menuItem.id }`
								);
								dispatch(
									recordTracksEvent( 'calypso_onboarding_tour_modal_section_menu_item_click', {
										section: menuItem.id,
									} )
								);
							} }
						>
							{ menuItem.label }
						</MenuItem>
					) ) }
				</div>
				<div className="onboarding-tour-modal__main">
					<Button
						className={ clsx( 'onboarding-tour-modal__close-button', {
							'is-light': currentSection?.props?.isDarkBanner,
						} ) }
						onClick={ () => {
							dispatch( recordTracksEvent( 'calypso_onboarding_tour_modal_close_button_click' ) );
							onClose();
						} }
						aria-label={ translate( 'Close' ) }
					>
						<Icon size={ 24 } icon={ close } />
					</Button>
					<div className="onboarding-tour-modal__main-banner-container">
						{ sections.map( ( section ) => (
							<img
								className={ clsx( 'onboarding-tour-modal__main-banner', {
									'is-visible': section.props.id === currentSection?.props.id,
								} ) }
								key={ section.props.id }
								src={ section?.props.bannerImage }
								alt=""
							/>
						) ) }
					</div>
					<div className="onboarding-tour-modal__main-content">
						<div
							className="onboarding-tour-modal__main-content-body"
							style={ {
								transform: `translateX(-${ currentSectionIndex * 100 }%)`,
							} }
						>
							{ sections }
						</div>
						<div className="onboarding-tour-modal__main-content-footer">
							{ actions }

							<OnboardingTourModalMobileNavigation
								menuItems={ menuItems }
								currentSectionId={ currentSectionId }
								setCurrentSectionId={ ( sectionId ) => {
									setCurrentSectionId( sectionId );
									window.history.replaceState(
										window.history.state,
										'',
										`${ ONBOARDING_TOUR_HASH }-${ sectionId }`
									);
									dispatch(
										recordTracksEvent( 'calypso_onboarding_tour_modal_section_menu_item_swipe', {
											section: sectionId,
										} )
									);
								} }
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
