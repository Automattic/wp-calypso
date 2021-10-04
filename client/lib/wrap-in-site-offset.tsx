import { SiteOffsetProvider } from 'calypso/components/site-offset/context';
import { Context } from './jetpack/types';

export default function wrapInSiteOffsetProvider( context: Context, next: () => void ): void {
	context.primary = (
		<SiteOffsetProvider site={ context.params.site }>{ context.primary }</SiteOffsetProvider>
	);
	next();
}
