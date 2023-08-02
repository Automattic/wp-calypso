import { useSelector } from 'calypso/state';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';

export function useSsoNotice( siteId: number ) {
	const active = useSelector( ( state ) => isJetpackModuleActive( state, siteId, 'sso' ) );
	const activating = useSelector( ( state ) => isActivatingJetpackModule( state, siteId, 'sso' ) );

	return ! ( active || activating );
}
