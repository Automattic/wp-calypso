/**
 * Types
 */
import type { Logo } from './logo-generator/store/types';
import type { SiteDetails } from '@automattic/data-stores';

export interface GeneratorModalProps {
	siteDetails?: SiteDetails;
	isOpen: boolean;
	onClose: () => void;
}

export interface LogoPresenterProps {
	logo?: Logo;
	loading?: boolean;
	onApplyLogo: () => void;
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

// Token
export type RequestTokenOptions = {
	siteDetails?: SiteDetails;
	isJetpackSite?: boolean;
	expirationTime?: number;
};

export type TokenDataProps = {
	token: string;
	blogId: string | undefined;
	expire: number;
};

export type TokenDataEndpointResponseProps = {
	token: string;
	blog_id: string;
};

export type SaveToStorageProps = Logo & {
	siteId: string;
};
