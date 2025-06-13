import { type SiteItem } from 'calypso/a8c-for-agencies/sections/migrations/hooks/use-fetch-all-managed-sites';
import type { ReactNode } from 'react';

export type A4ASelectSiteItem = {
	blogId: number;
	domain: string;
	managedSiteId: number;
};

export interface A4ASelectSiteProps {
	trackingEvent?: string;
	buttonLabel?: string;
	className?: string;
	onSiteSelect: ( site: A4ASelectSiteItem ) => void;
	title?: string;
	subtitle?: ReactNode;
	selectedSiteId?: number;
	isDisabled?: boolean;
}

export interface A4ASelectSiteButtonProps {
	buttonLabel?: string;
	className?: string;
	handleOpenModal: () => void;
}

export interface SelectSiteModalProps {
	onClose: () => void;
	onSiteSelect: ( site: A4ASelectSiteItem ) => void;
	title?: string;
	subtitle?: ReactNode;
	selectedSiteId?: number;
}

export interface SelectSiteTableProps {
	selectedSite: SiteItem | null;
	setSelectedSite: ( site: SiteItem | null ) => void;
	selectedSiteId?: number;
}
