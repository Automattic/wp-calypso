import { makeLayout, render as clientRender } from 'calypso/controller';
import { tagsListing, fetchTrendingTags } from './controller';

export default function ( router ) {
	router( '/tags', fetchTrendingTags, tagsListing, makeLayout, clientRender );
}
