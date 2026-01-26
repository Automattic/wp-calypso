import {
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import type { ReactNode } from 'react';

type Props = {
	title: ReactNode;
	descriptions?: ReactNode[];
	hint?: ReactNode;
};

export default function OnboardingTourModalSectionContent( {
	title,
	descriptions = [],
	hint,
}: Props ) {
	return (
		<VStack className="dashboard-onboarding-tour-modal__section-content" spacing={ 5 }>
			<Heading level={ 4 } className="dashboard-onboarding-tour-modal__section-content-title">
				{ title }
			</Heading>
			<VStack
				className="dashboard-onboarding-tour-modal__section-content-descriptions"
				spacing={ 4 }
			>
				{ descriptions.map( ( description: ReactNode, index: number ) => (
					<Text
						className="dashboard-onboarding-tour-modal__section-content-description"
						key={ `description-${ index }` }
					>
						{ description }
					</Text>
				) ) }
			</VStack>
			{ hint && (
				<Text className="dashboard-onboarding-tour-modal__section-content-hint">{ hint }</Text>
			) }
		</VStack>
	);
}
