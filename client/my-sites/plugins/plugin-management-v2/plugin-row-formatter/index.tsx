import { Gridicon } from '@automattic/components';
import { ReactElement } from 'react';
import type { Plugin } from '../types';

import './style.scss';

interface Props {
	item: Plugin;
	columnKey: string;
}

export default function PluginRowFormatter( { item, columnKey }: Props ): ReactElement | any {
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
					<span className="plugin-row-formatter__plugin-name">{ item.name }</span>
					<span className="plugin-row-formatter__overlay"></span>
				</span>
			);
		case 'sites':
			return Object.keys( item.sites ).length;
	}
}
