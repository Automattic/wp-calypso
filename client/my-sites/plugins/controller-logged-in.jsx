import { removeQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { successNotice } from 'calypso/state/notices/actions';
import Plans from './plans';
import PluginUpload from './plugin-upload';

export function upload( context, next ) {
	context.primary = <PluginUpload />;
	next();
}

export function maybeShowUpgradeSuccessNotice( context, next ) {
	if ( context.query.showUpgradeSuccessNotice ) {
		// Bump the notice to the back of the callstack so it is called after client render.
		setTimeout( () => {
			context.store.dispatch(
				successNotice( translate( 'Thank you for your purchase!' ), {
					id: 'plugin-upload-upgrade-plan-success',
					duration: 5000,
				} )
			);
		}, 0 );
		context.page.replace( removeQueryArgs( context.canonicalPath, 'showUpgradeSuccessNotice' ) );
	}
	next();
}

export function plans( context, next ) {
	context.primary = (
		<Plans
			intervalType={ context.params.intervalType }
			pluginSlug={ context.params.pluginSlug || false }
		/>
	);
	next();
}
