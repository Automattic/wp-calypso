import { MenuItem, Modal } from '@wordpress/components';
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
					<div
						className="onboarding-tour-modal__main-banner"
						style={ {
							backgroundImage: `url(${ currentSection?.props.bannerImage })`,
						} }
					></div>
					<div className="onboarding-tour-modal__main-content">
						<div className="onboarding-tour-modal__main-content-body">{ currentSection }</div>

						<div className="onboarding-tour-modal__main-content-footer"></div>
					</div>
				</div>
			</div>
		</Modal>
	);
}

OnboardingTourModal.Section = OnboardingTourModalSection;

export default OnboardingTourModal;
