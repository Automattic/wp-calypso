/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import Support from 'my-sites/customer-home/cards/features/support';
import QuickLinks from 'my-sites/customer-home/cards/actions/quick-links';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getHomeLayout } from 'state/selectors/get-home-layout';

const cardComponents = {
	'home-feature-go-mobile': GoMobile,
	'home-feature-support': Support,
	'home-action-quick-links': QuickLinks,
};

const ManageSite = ( { cards } ) => {
	const translate = useTranslate();

	return (
		<>
			<h2>{ translate( 'Manage your site' ) }</h2>
			{ cards &&
				cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
						} )
				) }
		</>
	);
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const layout = getHomeLayout( state, siteId );

	return {
		cards: layout?.[ 'tertiary.manage-site' ] ?? [],
	};
};

export default connect( mapStateToProps )( ManageSite );
