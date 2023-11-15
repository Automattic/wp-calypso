import page, { type Callback } from 'page';
import { addQueryArgs } from 'calypso/lib/route';
import { hideMasterbar } from 'calypso/state/ui/actions';
import JetpackComFooter from '../pricing/jpcom-footer';
import JetpackComMasterbar from '../pricing/jpcom-masterbar';
import { Content } from './content';
import Header from './header';

export const jetpackComparisonContext: Callback = ( context, next ) => {
	const urlQueryArgs = context.query;
	const { lang } = context.params;
	const path = context.path;

	if ( context.pathname.endsWith( '/features/comparison' ) && urlQueryArgs.site ) {
		page.redirect( addQueryArgs( urlQueryArgs, `${ context.pathname }/${ urlQueryArgs.site }` ) );
		return;
	}

	context.store.dispatch( hideMasterbar() );
	context.nav = <JetpackComMasterbar pathname={ lang ? path.replace( `/${ lang }`, '' ) : path } />;
	context.header = <Header />;
	context.footer = <JetpackComFooter />;

	context.primary = (
		<Content
			footer={ context.footer }
			header={ context.header }
			locale={ lang }
			nav={ context.nav }
			urlQueryArgs={ urlQueryArgs }
			rootUrl={ context.pathname }
		/>
	);
	next();
};
