import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export default function LayoutHeader( { children }: Props ) {
	return <div className="partner-portal-layout__header">{ children }</div>;
}
