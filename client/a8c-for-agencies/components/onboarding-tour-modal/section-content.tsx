import { TranslateResult } from 'i18n-calypso';
import { ReactNode } from 'react';

type Props = {
	title: ReactNode;
	descriptions?: ( string | TranslateResult )[];
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
				{ descriptions.map( ( description: string | TranslateResult, index: number ) => (
					<p
						className="onboarding-tour-modal__section-content-description"
						key={ `description-${ index }` }
					>
						{ description }
					</p>
				) ) }
			</div>
			{ hint && <div className="onboarding-tour-modal__section-content-hint">{ hint }</div> }
		</div>
	);
}
