import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import QueryThemeFilters from 'calypso/components/data/query-theme-filters';
import SectionHeader from 'calypso/components/section-header';
import { localizeThemesPath } from 'calypso/my-sites/themes/helpers';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isAmbiguousThemeFilterTerm } from 'calypso/state/themes/selectors';
import { isDelistedTaxonomyTermSlug } from 'calypso/state/themes/utils';

const ThemeFeaturesCard = ( { isWpcomTheme, siteSlug, features, translate, onClick, locale } ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	if ( isEmpty( features ) ) {
		return null;
	}

	return (
		<div>
			<QueryThemeFilters locale={ locale } />
			<SectionHeader label={ translate( 'Features' ) } />
			<Card>
				<ul className="theme__sheet-features-list">
					{ features.map( ( { name, slug, term } ) => {
						const filterPath = localizeThemesPath(
							`/themes/all/filter/${ term }/${ siteSlug || '' }`,
							locale,
							! isLoggedIn
						);
						return (
							<li key={ 'theme-features-item-' + slug }>
								{ ! isWpcomTheme ? (
									<span>{ name }</span>
								) : (
									<a onClick={ () => onClick?.( slug ) } href={ filterPath }>
										{ name }
									</a>
								) }
							</li>
						);
					} ) }
				</ul>
			</Card>
		</div>
	);
};

export default connect( ( state, { taxonomies } ) => {
	const features = get( taxonomies, 'theme_feature', [] )
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		.filter( ( { slug } ) => ! isDelistedTaxonomyTermSlug( slug ) )
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		.map( ( { name, slug } ) => ( {
			name,
			slug,
			term: isAmbiguousThemeFilterTerm( state, slug ) ? `feature:${ slug }` : slug,
		} ) );

	return { features };
} )( localize( ThemeFeaturesCard ) );
