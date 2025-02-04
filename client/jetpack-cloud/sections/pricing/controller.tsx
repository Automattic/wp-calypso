import page, { type Callback } from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { addQueryArgs } from 'calypso/lib/route';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { hideMasterbar } from 'calypso/state/ui/actions';
import Header from './header';
import JetpackComFooter from './jpcom-footer';
import JetpackComMasterbar from './jpcom-masterbar';

export const jetpackPricingContext: Callback = ( context, next ) => {
	const urlQueryArgs = context.query;
	const { lang } = context.params;
	const path = context.path;

	if ( context.pathname.endsWith( '/pricing' ) && urlQueryArgs.site ) {
		page.redirect( addQueryArgs( urlQueryArgs, `${ context.pathname }/${ urlQueryArgs.site }` ) );
		return;
	}

	const PricingHeader = () => {
		const translate = useTranslate();
		return (
			<Header
				urlQueryArgs={ urlQueryArgs }
				title={ translate( 'Security, performance, and marketing tools by the WordPress experts' ) }
			/>
		);
	};

	context.store.dispatch( hideMasterbar() );
	context.nav = (
		<CalypsoShoppingCartProvider>
			<JetpackComMasterbar pathname={ lang ? path.replace( `/${ lang }`, '' ) : path } />
		</CalypsoShoppingCartProvider>
	);
	context.header = <PricingHeader />;
	context.footer = <JetpackComFooter />;
	next();
};
