/**
 * Types
 */
import type { Logo } from './logo-generator/store/types';
import type { SiteDetails } from '@automattic/data-stores';

export interface GeneratorModalProps {
	siteDetails?: SiteDetails;
	isOpen: boolean;
	onClose: () => void;
	context: string;
}

export interface LogoPresenterProps {
	logo?: Logo;
	loading?: boolean;
	onApplyLogo: () => void;
	logoAccepted?: boolean;
	siteId: string | number;
}

export type SaveToMediaLibraryProps = {
	siteId: string | number;
	url: string;
	logo?: Logo;
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

export type CheckMediaProps = {
	siteId: string | number;
	mediaId: Logo[ 'mediaId' ];
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

export type UpdateInStorageProps = {
	siteId: string;
	url: Logo[ 'url' ];
	newUrl: Logo[ 'url' ];
	mediaId: Logo[ 'mediaId' ];
};

export type RemoveFromStorageProps = {
	mediaId: Logo[ 'mediaId' ];
	siteId: string;
};
