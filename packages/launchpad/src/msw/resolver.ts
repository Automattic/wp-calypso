import { HttpResponse, HttpResponseResolver, delay } from 'msw';
import free from './setup-free';

export const launchpadResolver: HttpResponseResolver = async () => {
	// Random delay to make the UI feel more realistic
	await delay();

	return HttpResponse.json( free );
};
