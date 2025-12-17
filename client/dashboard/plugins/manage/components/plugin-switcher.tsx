import { useNavigate } from '@tanstack/react-router';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { pluginRoute } from '../../../app/router/plugins';
import { DataViewsCard } from '../../../components/dataviews';
import type { PluginListRow } from '../types';
import type { Field, View } from '@wordpress/dataviews';
import type { ComponentProps } from 'react';
import './plugin-switcher.scss';

export const PluginSwitcher = ( {
	pluginsWithIcon,
	selectedPluginSlug = '',
	view,
	fields,
	paginationInfo,
	onChangeView,
}: {
	pluginsWithIcon: PluginListRow[];
	selectedPluginSlug?: string;
	view: View;
	fields: Field< PluginListRow >[];
	paginationInfo: ComponentProps< typeof DataViews< PluginListRow > >[ 'paginationInfo' ];
	onChangeView: ( newView: View ) => void;
} ) => {
	const navigate = useNavigate();

	const onChangeSelection = ( selection: string[] ) => {
		if ( selection.length > 0 ) {
			navigate( {
				to: pluginRoute.fullPath,
				params: { pluginId: selection[ 0 ] },
				resetScroll: false,
			} );
		}
	};

	return (
		<DataViewsCard className="plugin-switcher-card">
			<DataViews< PluginListRow >
				getItemId={ ( item ) => item.slug }
				data={ pluginsWithIcon }
				fields={ fields }
				view={ view }
				onChangeView={ onChangeView }
				isLoading={ ! pluginsWithIcon }
				defaultLayouts={ { list: {} } }
				paginationInfo={ paginationInfo }
				onChangeSelection={ onChangeSelection }
				selection={ selectedPluginSlug ? [ selectedPluginSlug ] : [] }
				empty={
					<p>
						{ view.search
							? __( 'No results for this search term' )
							: __( 'No results for this period' ) }
					</p>
				}
			/>
		</DataViewsCard>
	);
};
