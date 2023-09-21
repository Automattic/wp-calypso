import { Gridicon, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { RelatedPlugin } from 'calypso/data/marketplace/types';
import { useGetRelatedPlugins } from 'calypso/data/marketplace/use-get-related-plugins';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { PluginPrice } from 'calypso/my-sites/plugins/plugin-price';
import PreinstalledPremiumPluginPriceDisplay from 'calypso/my-sites/plugins/plugin-price/preinstalled-premium-plugin-price-display';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';
import { getFirstCategoryFromTags } from '../categories/use-categories';

type RelatedPluginProps = {
	slug: string;
	size: number;
	seeAllLink?: string;
	options: {
		enabled?: boolean;
		staleTime?: number;
		refetchOnMount?: boolean;
	};
};

export function RelatedPlugins( { slug, size = 4, seeAllLink, options }: RelatedPluginProps ) {
	const translate = useTranslate();
	const { data: relatedPlugins } = useGetRelatedPlugins( slug, size, {
		...options,
	} ) as { data: RelatedPlugin[] };

	return (
		<div className="related-plugins">
			<div className="related-plugins__header">
				<h2>{ translate( 'Related plugins' ) }</h2>
				{ seeAllLink && (
					<Button className="is-link" borderless href={ seeAllLink }>
						<span>{ translate( 'See all' ) }</span>
						<Gridicon icon="chevron-right" />
					</Button>
				) }
			</div>
			<div className="related-plugins__list">
				{ relatedPlugins &&
					relatedPlugins.map( ( plugin: RelatedPlugin ) => (
						<RelatedPluginCard key={ plugin.slug } plugin={ plugin } />
					) ) }
			</div>
		</div>
	);
}

function RelatedPluginCard( { plugin }: { plugin: RelatedPlugin } ): JSX.Element {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );

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
			<PluginIcon image={ plugin.icon } className="related-plugins-item__icon" />
			<div className="related-plugins-item__info">
				<h3 className="related-plugins-item__title">{ plugin.name }</h3>
				<div className="related-plugins-item__excerpt">{ plugin.short_description }</div>
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
			</div>
		</a>
	);
}
