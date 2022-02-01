import { Title, SubTitle } from '@automattic/onboarding';
import { ReactElement } from 'react';

export default function StepContent( {
	title,
	subtitle,
	children,
}: {
	title?: string;
	subtitle?: string;
	children: ReactElement | null;
} ): ReactElement {
	return (
		<>
			<div className="transfer__heading-wrapper woocommerce-install__heading-wrapper">
				<div className="transfer__heading woocommerce-install__heading">
					{ title && <Title>{ title }</Title> }
					{ subtitle && <SubTitle>{ subtitle }</SubTitle> }
				</div>
			</div>
			<div className="transfer__content woocommerce-install__content">{ children }</div>
		</>
	);
}
