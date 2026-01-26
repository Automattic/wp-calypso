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
		<div className="dashboard-onboarding-tour-modal__section-content">
			<h1 className="dashboard-onboarding-tour-modal__section-content-title">{ title }</h1>
			<div className="dashboard-onboarding-tour-modal__section-content-descriptions">
				{ descriptions.map( ( description: ReactNode, index: number ) => (
					<p
						className="dashboard-onboarding-tour-modal__section-content-description"
						key={ `description-${ index }` }
					>
						{ description }
					</p>
				) ) }
			</div>
			{ hint && (
				<div className="dashboard-onboarding-tour-modal__section-content-hint">{ hint }</div>
			) }
		</div>
	);
}
