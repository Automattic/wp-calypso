/**
 * External dependencies
 */
import React, { useState, useMemo } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlansNavigation from 'my-sites/plans/navigation';
import CartData from 'components/data/cart';
import FormattedHeader from 'components/formatted-header';
import Notice from 'components/notice';
import { getSelectedSiteId } from 'state/ui/selectors';

const StandardPlansHeader = () => (
	<>
		<FormattedHeader headerText={ translate( 'Plans' ) } align="left" brandFont />
		<CartData>
			<PlansNavigation path={ '/plans' } />
		</CartData>
	</>
);
const ConnectFlowPlansHeader = () => (
	<>
		<div className="plans-v2__heading">
			<FormattedHeader
				headerText={ translate( 'Explore our Jetpack plans' ) }
				subHeaderText={ translate( "Now that you're set up, pick a plan that suits your needs." ) }
				align="left"
				brandFont
			/>
		</div>
		<CartData>
			<PlansNavigation path={ '/plans' } />
		</CartData>
	</>
);

const PlansHeader = ( { context }: { context: PageJS.Context } ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	const isInConnectFlow = useMemo(
		() =>
			/jetpack\/connect\/plans/.test( window.location.href ) ||
			/source=jetpack-(connect-)?plans/.test( window.location.href ),
		[ siteId ]
	);

	const [ showNotice, setShowNotice ] = useState( true );

	return isInConnectFlow ? (
		<>
			{ showNotice && (
				<Notice status="is-success" onDismissClick={ () => setShowNotice( false ) }>
					{ translate( 'Jetpack is now connected. Next select a plan.' ) }
				</Notice>
			) }
			<ConnectFlowPlansHeader />
		</>
	) : (
		<StandardPlansHeader />
	);
};

export default function setJetpackHeader( context: PageJS.Context ) {
	context.header = <PlansHeader context={ context } />;
}
