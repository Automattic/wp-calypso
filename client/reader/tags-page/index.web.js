import { makeLayout, render as clientRender } from 'calypso/controller';
import { tagsListing } from './controller';

export default function ( router ) {
	router( '/tags', tagsListing, makeLayout, clientRender );
}
