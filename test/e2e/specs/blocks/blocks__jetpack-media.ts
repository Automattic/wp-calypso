/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import {
	BlockFlow,
	SlideshowBlockFlow,
	TiledGalleryBlockFlow,
	ImageCompareFlow,
} from '@automattic/calypso-e2e';
import { TEST_IMAGE_PATH, ALT_TEST_IMAGE_PATH } from '../constants';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new SlideshowBlockFlow( { imagePaths: [ TEST_IMAGE_PATH, ALT_TEST_IMAGE_PATH ] } ),
	new TiledGalleryBlockFlow( { imagePaths: [ TEST_IMAGE_PATH, ALT_TEST_IMAGE_PATH ] } ),
	new ImageCompareFlow( { image1Path: TEST_IMAGE_PATH, image2Path: ALT_TEST_IMAGE_PATH } ),
];

createBlockTests( 'Blocks: Jetpack Media', blockFlows );
