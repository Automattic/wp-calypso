import PluginCommonCard from '../plugin-common/plugin-common-card';
import type { Columns, PluginRowFormatterArgs } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { Plugin } from 'calypso/state/plugins/installed/types';
import type { ReactNode } from 'react';

interface Props {
	item: Plugin;
	selectedSite: SiteDetails;
	rowFormatter: ( args: PluginRowFormatterArgs ) => ReactNode;
	columns: Columns;
	hasMoreActions: boolean;
}

export default function PluginCard( props: Props ) {
	return <PluginCommonCard { ...props } />;
}
