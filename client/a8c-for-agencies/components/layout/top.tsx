import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export default function LayoutTop( { children }: Props ) {
	return <div className="a4a-layout__top-wrapper">{ children }</div>;
}
