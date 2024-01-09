import { DEFAULT_LOGO } from '../../constants';
/**
 * Types
 */
import { SaveToStorageProps } from '../../types';

export function stashLogo( { siteId, url, description }: SaveToStorageProps ) {
	const storedString = localStorage.getItem( `logo-history-${ siteId }` );
	const storedContent = storedString ? JSON.parse( storedString ) : [];

	const logo = {
		url,
		description,
	};

	storedContent.push( logo );

	localStorage.setItem( `logo-history-${ siteId }`, JSON.stringify( storedContent.slice( -10 ) ) );
	return logo;
}

export function getSiteLogoHistory( siteId: string ) {
	const storedString = localStorage.getItem( `logo-history-${ siteId }` );
	const storedContent = storedString ? JSON.parse( storedString ) : [ DEFAULT_LOGO ];

	return storedContent;
}
