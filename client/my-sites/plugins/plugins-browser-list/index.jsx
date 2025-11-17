import { Card, DotPager } from '@automattic/components';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import Spotlight from 'calypso/components/spotlight';
import { getMessagePathForJITM } from 'calypso/lib/route';
import PluginBrowserItem from 'calypso/my-sites/plugins/plugins-browser-item';
import { PluginsBrowserElementVariant } from 'calypso/my-sites/plugins/plugins-browser-item/types';
import PluginsResultsHeader from 'calypso/my-sites/plugins/plugins-results-header';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { PluginsBrowserListVariant } from './types';
import './style.scss';

const DEFAULT_PLACEHOLDER_NUMBER = 6;
const DEFAULT_CAROUSEL_PAGE_SIZE = 3;

function chunkItems( items, chunkSize ) {
	if ( ! chunkSize || chunkSize <= 0 ) {
		return [];
	}

	const chunks = [];

	for ( let index = 0; index < items.length; index += chunkSize ) {
		chunks.push( items.slice( index, index + chunkSize ) );
	}

	return chunks;
}

const PluginsBrowserList = ( {
	plugins,
	variant = PluginsBrowserListVariant.Fixed,
	title,
	subtitle,
	resultCount,
	extended,
	showPlaceholders,
	site,
	currentSites,
	listName,
	listType,
	browseAllLink,
	size,
	search,
	noHeader = false,
	useCarousel = false,
	carouselPageSize = DEFAULT_CAROUSEL_PAGE_SIZE,
} ) => {
	const extendedVariant = extended
		? PluginsBrowserElementVariant.Extended
		: PluginsBrowserElementVariant.Compact;
	const shouldUseCarousel = useCarousel;

	const renderPluginsViewList = () => {
		const pluginsViewsList = plugins.map( ( plugin, n ) => {
			// Needs a beter fix but something is leaking empty objects into this list.
			if ( ! plugin?.slug ) {
				return null;
			}
			return (
				<PluginBrowserItem
					site={ site }
					key={ plugin.slug + n }
					gridPosition={ n + 1 }
					plugin={ plugin }
					currentSites={ currentSites }
					listName={ listName }
					listType={ listType }
					variant={ extendedVariant }
					search={ search }
				/>
			);
		} );

		if ( size ) {
			return pluginsViewsList.slice( 0, size );
		}

		return pluginsViewsList;
	};

	const renderPlaceholdersViews = () => {
		return times( size || DEFAULT_PLACEHOLDER_NUMBER, ( i ) => (
			<PluginBrowserItem
				isPlaceholder
				key={ 'placeholder-plugin-' + i }
				variant={ extendedVariant }
			/>
		) );
	};

	const getRenderableItems = () => {
		if ( ! plugins.length ) {
			return renderPlaceholdersViews();
		}

		switch ( variant ) {
			case PluginsBrowserListVariant.InfiniteScroll:
				if ( showPlaceholders ) {
					return renderPluginsViewList().concat( renderPlaceholdersViews() );
				}
				return renderPluginsViewList();
			case PluginsBrowserListVariant.Paginated:
				if ( showPlaceholders ) {
					return renderPlaceholdersViews();
				}
				return renderPluginsViewList();
			case PluginsBrowserListVariant.Fixed:
			default:
				return renderPluginsViewList();
		}
	};

	const items = ( getRenderableItems() || [] ).filter( Boolean );
	const pageSize = Math.max( 1, carouselPageSize );

	const renderViews = () => {
		if ( shouldUseCarousel ) {
			const slides = chunkItems( items, pageSize );

			if ( ! slides.length ) {
				return null;
			}

			return (
				<div className="plugins-browser-list__carousel">
					<DotPager className="plugins-browser-list__carousel-pager" hasDynamicHeight>
						{ slides.map( ( slideItems, index ) => (
							<Card
								tagName="ul"
								className="plugins-browser-list__elements"
								key={ `plugins-carousel-slide-${ index }` }
							>
								{ slideItems }
							</Card>
						) ) }
					</DotPager>
				</div>
			);
		}

		return (
			<Card tagName="ul" className="plugins-browser-list__elements">
				{ items }
			</Card>
		);
	};

	const SpotlightPlaceholder = (
		<Spotlight
			isPlaceholder
			taglineText="Calypso placeholder"
			illustrationSrc="https://wordpress.com/wp-content/lib/marketplace-images/sensei-pro.svg"
			onClick={ () => {} }
			titleText="This is the default placeholder rendered in Calypso"
			ctaText="Click me"
		/>
	);

	// Get the message path for the current route. This is needed to be able to display JITMs
	const currentRoute = useSelector( getCurrentRoute );
	const sectionJitmPath = getMessagePathForJITM( currentRoute );

	return (
		<div className="plugins-browser-list">
			{ ! noHeader && ( title || subtitle || resultCount || browseAllLink ) && (
				<PluginsResultsHeader
					title={ title }
					subtitle={ subtitle }
					resultCount={ resultCount }
					browseAllLink={ browseAllLink }
					listName={ listName }
					isRootPage={ listType !== 'browse' }
				/>
			) }
			{ listName === 'paid' && (
				<AsyncLoad
					require="calypso/blocks/jitm"
					template="spotlight"
					placeholder={ null }
					messagePath="calypso:plugins:spotlight"
				/>
			) }
			{ listType === 'search' && (
				<AsyncLoad
					require="calypso/blocks/jitm"
					template="spotlight"
					jitmPlaceholder={ SpotlightPlaceholder }
					messagePath="calypso:plugins:search"
					searchQuery={ search }
				/>
			) }
			{ listType === 'browse' && (
				<AsyncLoad
					require="calypso/blocks/jitm"
					template="spotlight"
					jitmPlaceholder={ SpotlightPlaceholder }
					messagePath={ `calypso:${ sectionJitmPath }:spotlight` }
				/>
			) }
			{ renderViews() }
		</div>
	);
};

PluginsBrowserList.propTypes = {
	plugins: PropTypes.array.isRequired,
	variant: PropTypes.oneOf( Object.values( PluginsBrowserListVariant ) ).isRequired,
	extended: PropTypes.bool,
	useCarousel: PropTypes.bool,
	carouselPageSize: PropTypes.number,
};

export default PluginsBrowserList;
