import { Gridicon, Button } from '@automattic/components';
import type { Plugin } from '../types';
import type { ReactChild, ReactElement } from 'react';

import './style.scss';

interface Props {
	item: Plugin;
	columnKey: string;
}

export default function PluginRowFormatter( { item, columnKey }: Props ): ReactElement | any {
	const PluginDetailsButton = ( props: { className: string; children: ReactChild } ) => {
		return <Button borderless compact href={ `/plugins/${ item.slug }` } { ...props } />;
	};

	switch ( columnKey ) {
		case 'plugin':
			return (
				<span className="plugin-row-formatter__plugin-name-container">
					{ item.icon ? (
						<img
							className="plugin-row-formatter__plugin-icon"
							src={ item.icon }
							alt={ item.name }
						/>
					) : (
						<Gridicon className="plugin-row-formatter__plugin-icon has-opacity" icon="plugins" />
					) }
					<PluginDetailsButton className="plugin-row-formatter__plugin-name">
						{ item.name }
					</PluginDetailsButton>
					<span className="plugin-row-formatter__overlay"></span>
				</span>
			);
		case 'sites':
			return (
				<PluginDetailsButton className="plugin-row-formatter__sites-count-button">
					{ Object.keys( item.sites ).length }
				</PluginDetailsButton>
			);
	}
}
