import { Gridicon, Button, DotPager } from '@automattic/components';
import { useViewportMatch } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import FullWidthSection from 'calypso/components/full-width-section';
import { RelatedPlugin } from 'calypso/data/marketplace/types';
import { useGetRelatedPlugins } from 'calypso/data/marketplace/use-get-related-plugins';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { useIsMarketplaceRedesignEnabled } from 'calypso/my-sites/plugins/hooks/use-is-marketplace-redesign-enabled';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { PluginPrice } from 'calypso/my-sites/plugins/plugin-price';
import PreinstalledPremiumPluginPriceDisplay from 'calypso/my-sites/plugins/plugin-price/preinstalled-premium-plugin-price-display';
import { BrowseAllAction } from 'calypso/my-sites/plugins/plugins-results-header';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getFirstCategoryFromTags } from '../categories/use-categories';

import './style.scss';

const DEFAULT_LIST_SIZE = 4;
const CAROUSEL_LIST_SIZE = 18;

type RelatedPluginProps = {
	slug: string;
	size?: number;
	seeAllLink?: string;
	options?: {
		enabled?: boolean;
		staleTime?: number;
		refetchOnMount?: boolean;
	};
};

function chunkItems< T >( items: T[], chunkSize: number ): T[][] {
	if ( ! items || ! items.length || ! chunkSize || chunkSize <= 0 ) {
		return [];
	}

	const chunks: T[][] = [];

	for ( let index = 0; index < items.length; index += chunkSize ) {
		chunks.push( items.slice( index, index + chunkSize ) );
	}

	return chunks;
}

export function RelatedPlugins( { slug, size, seeAllLink, options }: RelatedPluginProps ) {
	const translate = useTranslate();
	const isUseCarousel = useIsMarketplaceRedesignEnabled();
	const isLargeOrAbove = useViewportMatch( 'large' );
	const isWideOrAbove = useViewportMatch( 'wide' );

	// Use the size prop if provided, otherwise use the appropriate default based on the flag
	const listSize = size ?? ( isUseCarousel ? CAROUSEL_LIST_SIZE : DEFAULT_LIST_SIZE );

	const { data: relatedPlugins } = useGetRelatedPlugins( slug, listSize, {
		...options,
	} ) as { data: RelatedPlugin[] };

	let carouselPageSize = 6;
	if ( ! isLargeOrAbove ) {
		carouselPageSize = 2;
	} else if ( ! isWideOrAbove ) {
		carouselPageSize = 4;
	}

	const browseAllAction = (
		<BrowseAllAction browseAllLink={ seeAllLink } listName="related-plugins" />
	);

	if ( ! relatedPlugins?.length ) {
		return null;
	}

	const renderPluginsList = () => {
		if ( ! relatedPlugins ) {
			return null;
		}

		if ( isUseCarousel ) {
			const slides = chunkItems( relatedPlugins, carouselPageSize );

			if ( ! slides.length ) {
				return null;
			}

			return (
				<div className="related-plugins__carousel">
					<DotPager
						className="related-plugins__carousel-pager"
						hasDynamicHeight
						showDots={ false }
						controlsAction={ browseAllAction }
						navigationVariant="button"
					>
						{ slides.map( ( slideItems, index ) => (
							<div
								className="related-plugins__list"
								key={ `related-plugins-carousel-slide-${ index }` }
							>
								{ slideItems.map( ( plugin: RelatedPlugin ) => (
									<RelatedPluginCard key={ plugin.slug } plugin={ plugin } />
								) ) }
							</div>
						) ) }
					</DotPager>
				</div>
			);
		}

		return (
			<div className="related-plugins__list">
				{ relatedPlugins.map( ( plugin: RelatedPlugin ) => (
					<RelatedPluginCard key={ plugin.slug } plugin={ plugin } />
				) ) }
			</div>
		);
	};

	return (
		<FullWidthSection className="full-width-section--gray" enabled={ isUseCarousel }>
			<div className="related-plugins">
				<div className="related-plugins__header">
					<h2>{ translate( 'Related plugins' ) }</h2>
					{ ! isUseCarousel && seeAllLink && (
						<Button className="is-link" borderless href={ seeAllLink }>
							<span>{ translate( 'See all' ) }</span>
							<Gridicon icon="chevron-right" />
						</Button>
					) }
				</div>
				{ renderPluginsList() }
			</div>
		</FullWidthSection>
	);
}

function RelatedPluginCard( { plugin }: { plugin: RelatedPlugin } ): JSX.Element {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const isMarketplaceRedesignEnabled = useIsMarketplaceRedesignEnabled();

	const pluginLink = useMemo( () => {
		let url = '/plugins/' + plugin.slug;
		if ( selectedSite ) {
			url += '/' + selectedSite.slug;
		}
		return url;
	}, [ plugin.slug, selectedSite ] );

	const mainCategory = getFirstCategoryFromTags( plugin.categories );

	return (
		<a className="related-plugins-item" href={ pluginLink }>
			<PluginIcon
				image={ plugin.icon }
				className="related-plugins-item__icon"
				size={ isMarketplaceRedesignEnabled ? 40 : undefined }
			/>
			<div className="related-plugins-item__info">
				<h3 className="related-plugins-item__title">{ plugin.name }</h3>
				<div className="related-plugins-item__excerpt">{ plugin.short_description }</div>
				{ ! isMarketplaceRedesignEnabled && (
					<div className="related-plugins-item__details">
						<PluginPrice plugin={ plugin } billingPeriod={ IntervalLength.MONTHLY }>
							{ ( {
								isFetching,
								price,
								period,
							}: {
								isFetching: boolean;
								price: string;
								period: string;
							} ) => {
								if ( isFetching ) {
									return '...';
								}

								if ( price ) {
									return (
										<PreinstalledPremiumPluginPriceDisplay
											className="related-plugins-item__price-interval"
											period={ period }
											pluginSlug={ plugin.slug }
											price={ price }
										/>
									);
								}

								return <>{ translate( 'Free' ) }</>;
							} }
						</PluginPrice>
						{ mainCategory && (
							<span className="related-plugins-item__category">{ mainCategory }</span>
						) }
					</div>
				) }
			</div>
		</a>
	);
}
