import { Title, SubTitle } from '@automattic/onboarding';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren< {
	title?: string;
	subtitle?: string;
} >;

export default function StepContent( { title, subtitle, children }: Props ) {
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
