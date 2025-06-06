import { ReactNode } from 'react';

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
		<div className="onboarding-tour-modal__section-content">
			<h1 className="onboarding-tour-modal__section-content-title">{ title }</h1>
			<div className="onboarding-tour-modal__section-content-descriptions">
				{ descriptions.map( ( description, index ) => (
					<p
						className="onboarding-tour-modal__section-content-description"
						key={ `${ index }-${ description }` }
					>
						{ description }
					</p>
				) ) }
			</div>
			{ hint && <div className="onboarding-tour-modal__section-content-hint">{ hint }</div> }
		</div>
	);
}
