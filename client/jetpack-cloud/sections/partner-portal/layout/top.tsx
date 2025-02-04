import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export default function LayoutTop( { children }: Props ) {
	return (
		<div className="partner-portal-layout__top">
			<div className="partner-portal-layout__top-wrapper">{ children }</div>
		</div>
	);
}
