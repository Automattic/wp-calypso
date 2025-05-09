import page from '@automattic/calypso-router';
import { SearchControl } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { setQueryArgs } from 'calypso/lib/query-args';
import scrollTo from 'calypso/lib/scroll-to';
import { useLocalizedPlugins } from 'calypso/my-sites/plugins/utils';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useTermsSuggestions } from '../use-terms-suggestions';
import './style.scss';

const SearchBoxHeader = ( props ) => {
	const {
		searchTerm,
		title,
		subtitle,
		isSticky,
		stickySearchBoxRef,
		categoriesRef,
		renderTitleInH1,
		searchTerms,
	} = props;

	const isDesktop = useViewportMatch( 'large' );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSite = useSelector( getSelectedSite );
	const { localizePath } = useLocalizedPlugins();

	const recordSearchEvent = ( eventName ) => {
		dispatch( recordGoogleEvent( 'PluginsBrowser', eventName ) );
	};

	const classNames = [ 'search-box-header' ];

	if ( isSticky ) {
		classNames.push( 'fixed-top' );
	}

	return (
		<div className={ clsx( classNames ) }>
			{ renderTitleInH1 && <h1 className="search-box-header__header">{ title }</h1> }
			{ ! renderTitleInH1 && <div className="search-box-header__header">{ title }</div> }
			{ subtitle && <p className="search-box-header__subtitle">{ subtitle }</p> }
			<div className="search-box-header__search">
				<SearchControl
					__nextHasNoMarginBottom
					value={ searchTerm }
					className={ clsx( 'search-box-header__searchbox', {
						'components-search-control--mobile': ! isDesktop,
					} ) }
					placeholder={ translate( 'Try searching "%(searchTermSuggestion)s"', {
						args: { searchTermSuggestion: useTermsSuggestions( searchTerms ) || 'ecommerce' },
						textOnly: true,
					} ) }
					onChange={ ( newValue ) => {
						// Only update URL on clear
						if ( newValue === '' ) {
							recordSearchEvent( 'SearchCleared' );
							page.show( localizePath( `/plugins/${ selectedSite?.slug || '' }` ) );
							setQueryArgs( {} );
						}
					} }
					onKeyDown={ ( event ) => {
						if ( event.key === 'Enter' && event.target ) {
							event.preventDefault();
							const value = event.target.value;
							recordSearchEvent( 'SearchInitiated' );
							page.show( localizePath( `/plugins/${ selectedSite?.slug || '' }` ) );
							setQueryArgs( value ? { s: value } : {} );

							if ( value && categoriesRef?.current ) {
								scrollTo( {
									x: 0,
									y:
										categoriesRef.current.getBoundingClientRect().y - // Get to the top of categories
										categoriesRef.current.getBoundingClientRect().height, // But don't show the categories
									duration: 300,
								} );
							}
						}
					} }
				/>
			</div>
			<div className="search-box-header__sticky-ref" ref={ stickySearchBoxRef }></div>
		</div>
	);
};

export default SearchBoxHeader;
