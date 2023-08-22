import { Gridicon, Button } from '@automattic/components';
import { RelatedPlugin } from 'calypso/data/marketplace/types';
import { useGetRelatedPlugins } from 'calypso/data/marketplace/use-get-related-plugins';
import './style.scss';

type RelatedPluginProps = {
	slug: string;
	size: number;
	options: {
		enabled?: boolean;
		staleTime?: number;
		refetchOnMount?: boolean;
	};
};

function RelatedPlugins( { slug, size = 4, options }: RelatedPluginProps ) {
	const { data: relatedPlugins } = useGetRelatedPlugins( slug, size, { ...options } );

	return (
		<div className="related-plugins">
			<div className="related-plugins__header">
				<h2>Related plugins</h2>
				<Button borderless primary>
					<span>See all</span>
					<Gridicon icon="chevron-right" />
				</Button>
			</div>
			<div className="related-plugins__list">
				{ relatedPlugins.map( ( plugin: RelatedPlugin ) => (
					<RelatedPluginCard key={ plugin.slug } plugin={ plugin } />
				) ) }
			</div>
		</div>
	);
}

function RelatedPluginCard( { plugin }: { plugin: RelatedPlugin } ): JSX.Element {
	return (
		<div>
			<div>{ plugin.title }</div>
		</div>
	);
}

export default RelatedPlugins;
