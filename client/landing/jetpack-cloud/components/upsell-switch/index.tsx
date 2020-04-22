/**
 * External dependencies
 */
import React, { useEffect, ReactElement, useState } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryRewindCapabilities from 'components/data/query-rewind-capabilities';
import getRewindCapabilities from 'state/selectors/get-rewind-capabilities';
import { getSelectedSiteId } from 'state/ui/selectors';

interface Props {
	children: ReactElement;
	upsell: ReactElement;
	siteId: number | null;
	siteCapabilities?: string[];
	targetCapability: string;
}

function UpsellSwitch( props: Props ): React.ReactElement {
	const { siteCapabilities, targetCapability, upsell, children, siteId } = props;

	const [ { showUpsell, isLoading }, setState ] = useState( {
		showUpsell: true,
		isLoading: true,
	} );
	useEffect( () => {
		if ( ! Array.isArray( siteCapabilities ) ) {
			setState( {
				showUpsell: true,
				isLoading: true,
			} );
			return;
		}

		setState( {
			showUpsell: ! siteCapabilities.includes( targetCapability ),
			isLoading: false,
		} );
	}, [ siteCapabilities, targetCapability, siteId ] );

	if ( isLoading ) {
		return <QueryRewindCapabilities siteId={ siteId } />;
	}
	if ( showUpsell ) {
		return upsell;
	}
	return children;
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteCapabilities = getRewindCapabilities( state, siteId );

	return {
		siteId,
		siteCapabilities,
	};
} )( UpsellSwitch );
