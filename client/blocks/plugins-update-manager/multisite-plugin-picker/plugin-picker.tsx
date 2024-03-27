import { CheckboxControl, Spinner } from '@wordpress/components';
import { useSitesPluginsQuery } from 'calypso/data/plugins/use-sites-plugins-query';

type Props = {
	selectedSites: number[];
};

export const PluginPicker = ( { selectedSites }: Props ) => {
	const { data: plugins = [], isFetched } = useSitesPluginsQuery( selectedSites );

	return (
		<div className="form-field">
			<label htmlFor="plugins">Select plugins ({ plugins.length })</label>

			<div className="checkbox-options">
				<div className="checkbox-options-container">
					{ ! isFetched && <Spinner /> }

					{ isFetched &&
						plugins.map( ( plugin ) => (
							<CheckboxControl
								key={ plugin.id }
								label={ plugin.name }
								checked={ false }
								onChange={ () => {} }
							/>
						) ) }
				</div>
			</div>
		</div>
	);
};
