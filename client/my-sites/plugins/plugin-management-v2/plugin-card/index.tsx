import Card from '../common/card';
import type { Columns, PluginRowFormatterArgs, Plugin } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement, ReactNode } from 'react';

interface Props {
	item: Plugin;
	selectedSite: SiteData;
	rowFormatter: ( args: PluginRowFormatterArgs ) => ReactNode;
	columns: Columns;
	hasMoreActions: boolean;
}

export default function PluginCard( props: Props ): ReactElement {
	return <Card { ...props } />;
}
