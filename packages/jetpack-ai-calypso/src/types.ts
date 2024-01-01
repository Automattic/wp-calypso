/**
 * Types
 */
import type { SiteDetails } from '@automattic/data-stores';

export interface GeneratorModalProps {
	siteDetails?: SiteDetails;
	isOpen: boolean;
	onClose: () => void;
}

export type SaveToMediaLibraryProps = {
	siteId: string | number;
	url: string;
	attrs?: {
		caption?: string;
		description?: string;
		title?: string;
		alt?: string;
	};
};

export type SaveToMediaLibraryResponseProps = {
	code: number;
	media: [
		{
			ID: number;
			URL: string;
		},
	];
};

export type SetSiteLogoProps = {
	siteId: string | number;
	imageId: string | number;
};

export type SetSiteLogoResponseProps = {
	id: number;
	url: string;
};
