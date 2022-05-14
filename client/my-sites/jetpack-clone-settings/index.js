import Debug from 'debug';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { jetpackCloneSettingsMainPath } from './paths';
import IsJetpackDisconnectedSwitch from 'calypso/components/jetpack/is-jetpack-disconnected-switch';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import JetpackCloneSettingsDisconnected from './disconnected';
import CloneSettingsMain from './main';

const debug = new Debug( 'calypso:my-sites:jetpack-clone-settings:controller' );

/* handles /jetpack-clone-settings/:site, see `jetpackCloneSettingsMainPath` */
function jetpackCloneSettingsMain( context, next ) {
	debug( 'controller: jetpackCloneSettingsMain', context.params );

	if ( ! isJetpackCloud() ) {
		context.primary = <CloneSettingsMain />;
	}

	next();
}

function showJetpackIsDisconnected( context, next ) {
	debug( 'controller: showJetpackIsDisconnected', context.params );
	context.primary = (
		<IsJetpackDisconnectedSwitch
			trueComponent={ <JetpackCloneSettingsDisconnected /> }
			falseComponent={ context.primary }
		/>
	);
	next();
}

export default function () {
	/* handles /jetpack-search/:site, see `jetpackSearchMainPath` */
	page(
		jetpackCloneSettingsMainPath( ':site' ),
		siteSelection,
		navigation,
		jetpackCloneSettingsMain,
		showJetpackIsDisconnected,
		makeLayout,
		clientRender
	);
	/* handles /jetpack-clone-settings, see `jetpackCloneSettingsMainPath` */
	page( jetpackCloneSettingsMainPath(), siteSelection, sites, makeLayout, clientRender );
}
