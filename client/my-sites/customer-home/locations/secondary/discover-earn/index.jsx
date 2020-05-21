/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import RecurringPayments from 'my-sites/customer-home/cards/education/earn/recurring-payments';
import SimplePayments from 'my-sites/customer-home/cards/education/earn/simple-payments';
import PremiumContent from 'my-sites/customer-home/cards/education/earn/premium-content';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getHomeLayout } from 'state/selectors/get-home-layout';
import {
	EDUCATION_EARN_RECURRING_PAYMENTS,
	EDUCATION_EARN_SIMPLE_PAYMENTS,
	EDUCATION_EARN_PREMIUM_CONTENT,
} from 'my-sites/customer-home/cards/constants';

/**
 * Style dependencies
 */
import './style.scss';

const cardComponents = {
	[ EDUCATION_EARN_RECURRING_PAYMENTS ]: RecurringPayments,
	[ EDUCATION_EARN_SIMPLE_PAYMENTS ]: SimplePayments,
	[ EDUCATION_EARN_PREMIUM_CONTENT ]: PremiumContent,
};

const DiscoverEarn = ( { cards } ) => {
	const translate = useTranslate();

	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			<h2 className="discover-earn__heading customer-home__section-heading">
				{ translate( 'Earn Money' ) }
			</h2>
			<Card className="discover-earn__content">
				{ cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
						} )
				) }
			</Card>
		</>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const layout = getHomeLayout( state, siteId );

	return {
		cards: layout?.[ 'secondary.discover-earn' ] ?? [],
	};
};

export default connect( mapStateToProps )( DiscoverEarn );
