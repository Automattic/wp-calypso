// Browser Manager
export type viewportName = 'desktop' | 'mobile' | 'laptop' | 'tablet';
export type localeCode = string;

export type viewportSize = {
	width: number;
	height: number;
};

/**
 * Interface for holding various parts of a filepath.
 */
export interface TestFile {
	fullpath: string; // eg. /usr/home/wp-calypso/test/e2e/image-uploads/image.jpg
	dirname: string; // eg. /usr/home/wp-calypso/test/e2e/image-uploads/
	basename: string; // eg. image.jpg
	filename: string; // eg. image
	extension: string; // eg. .jpg
}
