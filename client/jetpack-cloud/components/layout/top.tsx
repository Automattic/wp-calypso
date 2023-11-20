import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export default function LayoutTop( { children }: Props ) {
	return (
		<div className="jetpack-cloud-layout__top">
			<div className="jetpack-cloud-layout__top-wrapper">{ children }</div>
		</div>
	);
}
