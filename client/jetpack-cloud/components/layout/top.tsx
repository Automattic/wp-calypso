import { ReactNode } from 'react';
import ProgramSunsetBanner from 'calypso/jetpack-cloud/components/program-sunset-banner';

type Props = {
	children: ReactNode;
};

export default function LayoutTop( { children }: Props ) {
	return (
		<div className="jetpack-cloud-layout__top-wrapper">
			<ProgramSunsetBanner />
			{ children }
		</div>
	);
}
