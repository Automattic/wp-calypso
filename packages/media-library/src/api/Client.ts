/**
 * Internal dependencies
 */
import { fetch } from './fetch';

interface MediaItem {
	id: string;
	link: string;
	title: string;
}

interface ItemsResponse {
	media: MediaItem[];
	errors: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ItemResponse extends MediaItem {}

export class Client {
	public async list( siteId: string ): Promise< ItemsResponse > {
		// TODO: support criteria e.g. mime_type
		const res = await fetch( 'GET', `/sites/${ siteId }/media` );
		return res;
	}

	public async createFromFile( siteId: string, file: File ): Promise< ItemsResponse > {
		return await fetch( 'POST', `/sites/${ siteId }/media/new`, [ [ 'media[]', file ] ] );
	}

	public async createFromURL( siteId: string, url: string ): Promise< ItemsResponse > {
		return await fetch( 'POST', `/sites/${ siteId }/media/new`, [ [ 'media_urls[]', url ] ] );
	}

	public async get( siteId: string, mediaId: string ): Promise< ItemResponse > {
		const res = await fetch( 'GET', `/sites/${ siteId }/media/${ mediaId }` );
		return res;
	}

	public async update(
		siteId: string,
		mediaId: string,
		data: Partial< MediaItem >
	): Promise< ItemResponse > {
		const keys: Array< keyof MediaItem > = Object.keys( data ) as any;
		const res = await fetch( 'POST', `/sites/${ siteId }/media/${ mediaId }`, [
			[ 'ID', mediaId ],
			...keys.map( key => [ key, data[ key ] ] ),
		] );
		return res;
	}

	public async delete( siteId: string, mediaId: string ): Promise< ItemResponse > {
		const res = await fetch( 'POST', `/sites/${ siteId }/media/${ mediaId }/delete` );
		res.status === 'deleted';
		return res;
	}
}
