import { MenuItem, Modal } from '@wordpress/components';
import clsx from 'clsx';
import { Children, isValidElement, ReactElement, ReactNode, useMemo, useState } from 'react';
import OnboardingTourModalSection, { OnboardingTourModalSectionProps } from './section';

import './style.scss';

interface OnboardingTourModalProps {
	onClose: () => void;
	children?: React.ReactNode;
}

function OnboardingTourModal( { onClose, children }: OnboardingTourModalProps ) {
	const sections: ReactElement< OnboardingTourModalSectionProps >[] = Children.toArray(
		children
	).filter(
		( child: ReactNode ) => isValidElement( child ) && child.type === OnboardingTourModalSection
	) as ReactElement< OnboardingTourModalSectionProps >[];

	const [ currentSectionId, setCurrentSectionId ] = useState(
		sections.length > 0 ? sections[ 0 ].props?.id : null
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

	return (
		<Modal
			className="onboarding-tour-modal-wrapper"
			onRequestClose={ onClose }
			__experimentalHideHeader
		>
			<div className="onboarding-tour-modal">
				<div className="onboarding-tour-modal__aside">
					{ menuItems.map( ( menuItem ) => (
						<MenuItem key={ menuItem.id } onClick={ () => setCurrentSectionId( menuItem.id ) }>
							{ menuItem.label }
						</MenuItem>
					) ) }
				</div>
				<div className="onboarding-tour-modal__main">
					<div className="onboarding-tour-modal__main-banner-container">
						{ sections.map( ( section ) => (
							<div
								className={ clsx( 'onboarding-tour-modal__main-banner', {
									'is-visible': section.props.id === currentSection?.props.id,
								} ) }
								key={ section.props.id }
								style={ {
									backgroundImage: `url(${ section?.props.bannerImage })`,
								} }
							></div>
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
						<div className="onboarding-tour-modal__main-content-footer"></div>
					</div>
				</div>
			</div>
		</Modal>
	);
}

OnboardingTourModal.Section = OnboardingTourModalSection;

export default OnboardingTourModal;
