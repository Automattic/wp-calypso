import BloggerImporter from 'calypso/blocks/importer/blogger';
import MediumImporter from 'calypso/blocks/importer/medium';
import SquarespaceImporter from 'calypso/blocks/importer/squarespace';
import SubstackImporter from 'calypso/blocks/importer/substack';
import WixImporter from 'calypso/blocks/importer/wix';
import WordpressImporter from 'calypso/blocks/importer/wordpress';

export type ImporterCompType =
	| typeof WixImporter
	| typeof BloggerImporter
	| typeof MediumImporter
	| typeof WordpressImporter
	| typeof SquarespaceImporter
	| typeof SubstackImporter;
