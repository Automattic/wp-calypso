import { HttpResponse, HttpResponseResolver, delay } from 'msw';
import linkInBio from './link-in-bio';
import free from './setup-free';

export const launchpadResolver: HttpResponseResolver = async ( { request } ) => {
	const searchParams = new URL( request.url ).searchParams;
	const checklistSlug = searchParams.get( 'checklist_slug' );

	// Random delay to make the UI feel more realistic

	await delay();

	if ( checklistSlug === 'link-in-bio' ) {
		return HttpResponse.json( linkInBio );
	}

	return HttpResponse.json( free );
};
