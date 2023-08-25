import { Gridicon, Button } from '@automattic/components';
import { useMemo } from 'react';
import { RelatedPlugin } from 'calypso/data/marketplace/types';
import { useGetRelatedPlugins } from 'calypso/data/marketplace/use-get-related-plugins';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

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

function RelatedPlugins( { slug, size = 4, seeAllLink, options }: RelatedPluginProps ) {
	const { data: relatedPlugins } = useGetRelatedPlugins( slug, size, { ...options } );

	return (
		<div className="related-plugins">
			<div className="related-plugins__header">
				<h2>Related plugins</h2>
				{ seeAllLink && (
					<Button borderless primary>
						<span>See all</span>
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

function RelatedPluginCard( {
	plugin: { icon, title, excerpt, slug },
}: {
	plugin: RelatedPlugin;
} ): JSX.Element {
	const selectedSite = useSelector( getSelectedSite );

	const pluginLink = useMemo( () => {
		let url = '/plugins/' + slug;
		if ( selectedSite ) {
			url += '/' + selectedSite.slug;
		}
		return url;
	}, [ slug, selectedSite ] );

	return (
		<a className="related-plugins-item" href={ pluginLink }>
			<PluginIcon image={ icon } className="related-plugins-item__icon" />
			<div className="related-plugins-item__details">
				<h3 className="related-plugins-item__title">{ title }</h3>
				<div className="related-plugins-item__excerpt">{ excerpt }</div>
			</div>
		</a>
	);
}

export default RelatedPlugins;
