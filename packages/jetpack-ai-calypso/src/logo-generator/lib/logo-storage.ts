/**
 * Types
 */
import { SaveToStorageProps } from '../../types';
import { Logo } from '../store/types';

export function stashLogo( { siteId, url, description, mediaId }: SaveToStorageProps ) {
	const storedString = localStorage.getItem( `logo-history-${ siteId }` );
	const storedContent = storedString ? JSON.parse( storedString ) : [];

	const logo: Logo = {
		url,
		description,
		mediaId,
	};

	storedContent.push( logo );

	localStorage.setItem( `logo-history-${ siteId }`, JSON.stringify( storedContent.slice( -10 ) ) );
	return logo;
}

export function getSiteLogoHistory( siteId: string ) {
	const storedString = localStorage.getItem( `logo-history-${ siteId }` );
	const storedContent = storedString ? JSON.parse( storedString ) : [];

	return storedContent;
}

export function isLogoHistoryEmpty( siteId: string ) {
	const storedContent = getSiteLogoHistory( siteId );

	return storedContent.length === 0;
}
