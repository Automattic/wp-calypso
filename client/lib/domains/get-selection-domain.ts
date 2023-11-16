import { type as domainTypes } from './constants';

export function getSelectedDomain<
	T extends {
		type?: string;
		name?: string;
	},
>( {
	domains,
	selectedDomainName,
	isSiteRedirect = false,
}: {
	domains: T[] | Record< string, T > | null;
	selectedDomainName: string;
	isSiteRedirect?: boolean;
} ): T | undefined {
	if ( ! domains ) {
		return undefined;
	}
	const domainList = Array.isArray( domains ) ? domains : Object.values( domains );
	return domainList.find( ( domain ) => {
		const isType = ( type: string ) => domain.type === type;

		if ( domain.name !== selectedDomainName ) {
			return false;
		}

		if ( isSiteRedirect && isType( domainTypes.SITE_REDIRECT ) ) {
			return true;
		}

		return ! isType( domainTypes.SITE_REDIRECT );
	} );
}
