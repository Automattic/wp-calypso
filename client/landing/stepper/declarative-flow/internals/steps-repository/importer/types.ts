import BloggerImporter from 'calypso/signup/steps/import-from/blogger';
import MediumImporter from 'calypso/signup/steps/import-from/medium';
import SquarespaceImporter from 'calypso/signup/steps/import-from/squarespace';
import WixImporter from 'calypso/signup/steps/import-from/wix';
import WordpressImporter from 'calypso/signup/steps/import-from/wordpress';

export type ImporterCompType =
	| typeof WixImporter
	| typeof BloggerImporter
	| typeof MediumImporter
	| typeof WordpressImporter
	| typeof SquarespaceImporter;
