import { useContext } from 'react';
import { PluginUpdateManagerContext } from '../context';

export function useSiteSlug() {
	const { siteSlug } = useContext( PluginUpdateManagerContext );
	return siteSlug;
}
