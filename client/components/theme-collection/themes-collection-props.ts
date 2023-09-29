import { useTranslate } from 'i18n-calypso';

export interface ThemesCollectionProps {
	getScreenshotUrl: ( themeId: string ) => string;
	siteId: string | null;
	getButtonOptions: () => void;
	getActionLabel: () => string;
	isActive: () => boolean;
	getPrice: () => string;
	isInstalling: () => boolean;
	themes: never[];
	translate: ReturnType< typeof useTranslate >;
}
