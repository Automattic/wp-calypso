import page from 'page';
import { buildRelativeSearchUrl } from 'calypso/lib/build-url';
import { localizeThemesPath } from 'calypso/my-sites/themes/helpers';
import { Category, isCategory, Tier } from 'calypso/my-sites/themes/v2/types';

type SectionsProps = {
	category?: Category | null;
	vertical?: string | null;
	tier?: string | null;
	filter?: string | null;
	siteSlug?: string;
	search?: string;
	locale?: string;
	isLoggedIn?: boolean;
	isCollectionView?: boolean;
};

const navigateTo = ( sections: SectionsProps ) => {
	let { category = Category.DEFAULT, filter = '' } = sections;
	const {
		vertical,
		tier = Tier.DEFAULT,
		siteSlug,
		search = '',
		locale,
		isLoggedIn,
		isCollectionView,
	} = sections;

	if ( isCategory( filter ) ) {
		category = filter;
		filter = null;
	}

	const urlParts = [
		'/themes',
		category && category !== Category.DEFAULT ? `/${ category }` : '',
		vertical ? `/${ vertical }` : '',
		tier && tier !== Tier.DEFAULT ? `/${ tier }` : '',
		( filter ? `/filter/${ filter }` : '' ).replace( /\s/g, '+' ),
		isCollectionView ? `/collection` : '',
		siteSlug ? `/${ siteSlug }` : '',
	];

	const themesPath = localizeThemesPath( urlParts.join( '' ), locale, ! isLoggedIn );

	page( buildRelativeSearchUrl( themesPath, search ) );
};

export default navigateTo;
