import type { ReactNode, FC } from 'react';

export const MasterBarMobileMenu: FC< { children: ReactNode; open: boolean } > = ( {
	children,
	open,
} ) => {
	if ( ! open ) {
		return null;
	}
	return <div className="masterbar__mobile-menu-container">{ children }</div>;
};
