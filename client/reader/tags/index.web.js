import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from '../controller';
import { tagsListing, fetchTrendingTags, fetchAlphabeticTags } from './controller';

export default function ( router ) {
	router(
		'/tags',
		fetchTrendingTags,
		fetchAlphabeticTags,
		sidebar,
		tagsListing,
		makeLayout,
		clientRender
	);
}
