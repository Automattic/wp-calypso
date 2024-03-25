/**
 * Types
 */
import { RemoveFromStorageProps, SaveToStorageProps } from '../../types';
import { Logo } from '../store/types';
import { mediaExists } from './media-exists';

const MAX_LOGOS = 10;

export function stashLogo( { siteId, url, description, mediaId }: SaveToStorageProps ) {
	const storedString = localStorage.getItem( `logo-history-${ siteId }` );
	const storedContent = storedString ? JSON.parse( storedString ) : [];

	const logo: Logo = {
		url,
		description,
		mediaId,
	};

	storedContent.push( logo );

	localStorage.setItem(
		`logo-history-${ siteId }`,
		JSON.stringify( storedContent.slice( -MAX_LOGOS ) )
	);
	return logo;
}

export function getSiteLogoHistory( siteId: string ) {
	const storedString = localStorage.getItem( `logo-history-${ siteId }` );
	let storedContent: Logo[] = storedString ? JSON.parse( storedString ) : [];

	// Ensure that the stored content is an array
	if ( ! Array.isArray( storedContent ) ) {
		storedContent = [];
	}

	// Ensure a maximum of 10 logos are stored
	storedContent = storedContent.slice( -MAX_LOGOS );

	// Ensure that the stored content is an array of Logo objects
	storedContent = storedContent
		.filter( ( logo ) => {
			return (
				typeof logo === 'object' &&
				typeof logo.url === 'string' &&
				typeof logo.description === 'string' &&
				logo.mediaId !== undefined &&
				typeof logo.mediaId === 'number'
			);
		} )
		.map( ( logo ) => ( {
			url: logo.url,
			description: logo.description,
			mediaId: logo.mediaId,
		} ) );

	return storedContent;
}

export function isLogoHistoryEmpty( siteId: string ) {
	const storedContent = getSiteLogoHistory( siteId );

	return storedContent.length === 0;
}

export function removeLogo( { siteId, mediaId }: RemoveFromStorageProps ) {
	const storedContent = getSiteLogoHistory( siteId );
	const index = storedContent.findIndex( ( logo ) => logo.mediaId === mediaId );

	if ( index === -1 ) {
		return;
	}

	storedContent.splice( index, 1 );
	localStorage.setItem( `logo-history-${ siteId }`, JSON.stringify( storedContent ) );
}

export async function clearDeletedMedia( siteId: string ) {
	const storedContent = getSiteLogoHistory( siteId );

	const checks = storedContent
		.filter( ( { mediaId } ) => mediaId !== undefined )
		.map(
			( { mediaId } ) =>
				new Promise( ( resolve, reject ) => {
					mediaExists( { siteId, mediaId } )
						.then( ( exists ) => resolve( { mediaId, exists } ) )
						.catch( ( error ) => reject( error ) );
				} )
		);

	try {
		const responses = ( await Promise.all( checks ) ) as {
			mediaId: Logo[ 'mediaId' ];
			exists: boolean;
		}[];

		responses
			.filter( ( { exists } ) => ! exists )
			.forEach( ( { mediaId } ) => removeLogo( { siteId, mediaId } ) );
	} catch ( error ) {} // Assume that the media exists if there was a network error and do nothing to avoid data loss.
}
