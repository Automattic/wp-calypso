import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export default function LayoutBody( { children }: Props ) {
	return (
		<div className="a4a-layout__body">
			<div className="a4a-layout__body-wrapper">{ children }</div>
		</div>
	);
}
