/**
 * External dependencies
 */
import React, { ReactElement, useState, ReactNode, useEffect, ComponentType } from 'react';
import { connect, DefaultRootState } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import { getSelectedSiteId } from 'state/ui/selectors';
import isAtomicSite from 'state/selectors/is-site-wpcom-atomic';
import Main from 'components/main';

type QueryComponentProps = {
	siteId: number | null;
};

type QueryFunction = ( arg0: DefaultRootState, arg1: number | null ) => SiteState;

export type UpsellComponentProps = {
	reason?: string;
};

type SiteState = {
	state: string;
	reason?: string;
};

type Props = {
	children: ReactNode;
	UpsellComponent: ComponentType< UpsellComponentProps >;
	display: ReactElement;
	QueryComponent: ComponentType< QueryComponentProps >;
	getStateForSite: QueryFunction;
	siteId: number | null;
	siteState: SiteState | null;
	atomicSite: boolean;
};

function UpsellSwitch( props: Props ): React.ReactElement {
	const {
		UpsellComponent,
		display,
		children,
		QueryComponent,
		siteId,
		siteState,
		atomicSite,
	} = props;

	const [ { showUpsell, isLoading }, setState ] = useState( {
		showUpsell: true,
		isLoading: true,
	} );

	useEffect( () => {
		// Show loading placeholder, the site's state isn't initialized
		if ( ! siteState || siteState?.state === 'uninitialized' ) {
			return setState( {
				isLoading: true,
				showUpsell: true,
			} );
		}

		// Show the expected content. It's distinct to unavailable (active, inactive, provisioning)
		// or if it's an Atomic site
		if ( siteState.state !== 'unavailable' || atomicSite ) {
			return setState( {
				isLoading: false,
				showUpsell: false,
			} );
		}

		// Show the upsell page
		return setState( {
			isLoading: false,
			showUpsell: true,
		} );
	}, [ siteState ] );

	if ( isLoading ) {
		return (
			<Main
				className={ classNames( 'upsell-switch__loading', { is_jetpackcom: isJetpackCloud() } ) }
			>
				<QueryComponent siteId={ siteId } />
				{ children }
			</Main>
		);
	}
	if ( showUpsell ) {
		return <UpsellComponent reason={ siteState?.reason } />;
	}
	return display;
}

export default connect( ( state, ownProps: Props ) => {
	const siteId = getSelectedSiteId( state );
	const siteState = ownProps.getStateForSite( state, siteId );
	const atomicSite = siteId && isAtomicSite( state, siteId );

	return {
		siteId,
		siteState,
		atomicSite,
	};
} )( UpsellSwitch );
