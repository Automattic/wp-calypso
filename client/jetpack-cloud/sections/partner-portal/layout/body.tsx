import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export default function LayoutBody( { children }: Props ) {
	return (
		<div className="partner-portal-layout__body">
			<div className="partner-portal-layout__body-wrapper">{ children }</div>
		</div>
	);
}
