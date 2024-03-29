import { CheckboxControl, Spinner } from '@wordpress/components';
import { Key } from 'react';
import { useSitesPluginsGroupedQuery } from 'calypso/data/plugins/use-sites-plugins-query';
import { useSitesQuery } from 'calypso/data/sites/use-sites-query';

type Props = {
	selectedSites: number[];
};

export const PluginPickerGrouped = ( { selectedSites }: Props ) => {
	const { data: groupedPlugins, isFetched } = useSitesPluginsGroupedQuery( selectedSites );
	const { data: sites = [], isFetched: isSitesFetched } = useSitesQuery();

	return ! isFetched || ! isSitesFetched ? (
		<Spinner />
	) : (
		<>
			<h1>Select plugins</h1>
			{ groupedPlugins.common.map(
				( plugin: { id: Key | null | undefined; name: string | undefined } ) => (
					<CheckboxControl
						key={ plugin.id }
						label={ plugin.name }
						checked={ false }
						onChange={ () => {} }
					/>
				)
			) }

			{ Object.keys( groupedPlugins ).map( ( group ) =>
				group === 'common' ? null : (
					<div className="form-field">
						<label htmlFor="plugins">
							{ sites.find( ( s ) => s.ID.toString() === group )?.name }
						</label>
						{ groupedPlugins[ group ].map( ( plugin ) => (
							<CheckboxControl
								key={ plugin.id }
								label={ plugin.name }
								checked={ false }
								onChange={ () => {} }
							/>
						) ) }
					</div>
				)
			) }
		</>
	);
};
