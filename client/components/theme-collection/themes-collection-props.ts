export interface ThemesCollectionProps {
	getActionLabel: () => string;
	getButtonOptions: () => void;
	getPrice: () => string;
	getScreenshotUrl: ( themeId: string ) => string;
	isActive: () => boolean;
	isInstalling: () => boolean;
}
