import type { SiteDetails } from '@automattic/data-stores';

export type UseLogoProps = {
	subject?: string;
};

export interface GeneratorModalProps {
	siteDetails?: SiteDetails;
	isOpen: boolean;
	onClose: () => void;
}
