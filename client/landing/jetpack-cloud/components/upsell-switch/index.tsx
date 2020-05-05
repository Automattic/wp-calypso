/**
 * External dependencies
 */
import React, { ReactElement, useState, ReactNode, useEffect, ComponentType } from 'react';
import { connect, DefaultRootState } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';

type QueryComponentProps = {
	siteId: number | null;
};

type QueryFunction = ( arg0: DefaultRootState, arg1: number | null ) => SiteState;

type UpsellComponentProps = {
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
};

function UpsellSwitch( props: Props ): React.ReactElement {
	const { UpsellComponent, display, children, QueryComponent, siteId, siteState } = props;

	const [ { showUpsell, isLoading }, setState ] = useState( {
		showUpsell: true,
		isLoading: true,
	} );
	useEffect( () => {
		if ( ! siteState ) {
			return setState( {
				isLoading: true,
				showUpsell: true,
			} );
		}
		const { state } = siteState;
		if ( state === 'unavailable' ) {
			return setState( {
				isLoading: false,
				showUpsell: true,
			} );
		}
		return setState( {
			isLoading: false,
			showUpsell: false,
		} );
	}, [ siteState ] );

	if ( isLoading ) {
		return (
			<Main className="upsell-switch__loading">
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

	return {
		siteId,
		siteState,
	};
} )( UpsellSwitch );
