import { makeLayout } from 'calypso/controller';
import { tagsListing, fetchTrendingTags, fetchAlphabeticTags } from './controller';

export default function ( router ) {
	router( '/tags', fetchTrendingTags, fetchAlphabeticTags, tagsListing, makeLayout );
}
