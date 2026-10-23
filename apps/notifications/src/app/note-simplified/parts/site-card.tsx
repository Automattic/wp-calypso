import LinkCard from './link-card';
import SiteIdentity from './site-identity';
import type { NoteSite } from '../../types';

export default function SiteCard( { site, url }: { site: NoteSite; url: string } ) {
	const displayUrl = url.replace( /^https?:\/\/|\/$/g, '' );

	return <LinkCard href={ url } header={ <SiteIdentity site={ site } details={ displayUrl } /> } />;
}
