import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export default function LayoutBody( { children }: Props ) {
	return (
		<div className="jetpack-cloud-layout__body">
			<div className="jetpack-cloud-layout__body-wrapper">{ children }</div>
		</div>
	);
}
