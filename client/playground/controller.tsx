import config from '@automattic/calypso-config';
import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import page from 'page';
import Main from 'calypso/components/main';
import Playground from 'calypso/playground/components/playground';

export function featureFlagFirewall( context: PageJS.Context, next: () => void ) {
	if ( config.isEnabled( 'importer/site-backups' ) ) {
		next();
	} else {
		page.redirect( '/' );
	}
}

export function playgroundContext( context: PageJS.Context, next: () => void ): void {
	context.primary = (
		<>
			<Main fullWidthLayout>
				<Playground />
			</Main>
			<UniversalNavbarFooter />
		</>
	);

	next();
}
