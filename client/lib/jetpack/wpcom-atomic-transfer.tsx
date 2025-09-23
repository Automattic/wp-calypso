import { isEnabled } from '@automattic/calypso-config';
import BusinessATSwitch from 'calypso/components/jetpack/business-at-switch';
import { AtomicContentSwitch } from 'calypso/components/jetpack/wpcom-business-at';
import { useSelector } from 'calypso/state';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Context } from './types';
import type { RewindState } from 'calypso/state/data-layer/wpcom/sites/rewind/type';
import type { AppState } from 'calypso/types';
import type { ComponentType, ReactNode } from 'react';

type GateProps = {
	UpsellComponent: ComponentType;
	content?: AtomicContentSwitch;
	children?: ReactNode;
};

const AtomicATGate = ( { UpsellComponent, content, children }: GateProps ) => {
	const siteId = useSelector( getSelectedSiteId ) as number | undefined;
	const rewind = useSelector( ( state: AppState ) =>
		getRewindState( state, siteId )
	) as RewindState;
	const isUnavailable = rewind?.state === 'unavailable';

	if ( isUnavailable ) {
		return <BusinessATSwitch UpsellComponent={ UpsellComponent } content={ content } />;
	}

	return children as ReactNode;
};

export default function wpcomAtomicTransfer(
	UpsellComponent: ComponentType,
	content?: AtomicContentSwitch
): ( context: Context, next: () => void ) => void {
	return ( context, next ) => {
		const getState = context.store.getState;
		const siteId = getSelectedSiteId( getState() );
		const isJetpack = isJetpackSite( getState(), siteId );
		const isAtomic = isSiteWpcomAtomic( getState(), siteId );

		if ( ! isEnabled( 'jetpack-cloud' ) && context.primary ) {
			const originalPrimary = context.primary;
			if ( ! isJetpack ) {
				context.primary = (
					<BusinessATSwitch UpsellComponent={ UpsellComponent } content={ content } />
				);
			} else if ( isAtomic ) {
				context.primary = (
					<AtomicATGate UpsellComponent={ UpsellComponent } content={ content }>
						{ originalPrimary }
					</AtomicATGate>
				);
			}
		}

		next();
	};
}
