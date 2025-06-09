import type { ReactNode } from 'react';

export interface A4ASelectSiteProps {
	trackingEvent?: string;
	buttonLabel?: string;
	className?: string;
	onSiteSelect: ( siteId: number, siteDomain: string ) => void;
	title?: string;
	subtitle?: ReactNode;
}

export interface A4ASelectSiteButtonProps {
	buttonLabel?: string;
	className?: string;
	handleOpenModal: () => void;
}

export interface SelectSiteModalProps {
	onClose: () => void;
	onSiteSelect: ( siteId: number, siteDomain: string ) => void;
	title?: string;
	subtitle?: ReactNode;
}

export interface SelectSiteTableProps {
	selectedSite: SiteItem | null;
	setSelectedSite: ( site: SiteItem | null ) => void;
}
