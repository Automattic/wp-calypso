/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import { areAllUsersValid, getItemsForCart, newUsers } from 'lib/gsuite/new-users';
import GSuiteUpsellProductDetails from './product-details';
import GSuiteNewUserList from 'components/gsuite/gsuite-new-user-list';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import QueryProducts from 'components/data/query-products-list';
import { getProductCost } from 'state/products-list/selectors';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

const GSuiteUpsellCard = ( {
	currencyCode,
	domain,
	gSuiteCost,
	gSuiteProductSlug,
	onAddEmailClick,
	onSkipClick,
	recordTracksEvent,
} ) => {
	const [ users, setUsers ] = useState( newUsers( domain ) );

	const canContinue = areAllUsersValid( users );
	const translate = useTranslate();

	const recordClickEvent = eventName => {
		recordTracksEvent( eventName, {
			domain_name: domain,
			user_count: users.length,
		} );
	};

	const recordUsersChangedEvent = ( previousUsers, nextUsers ) => {
		if ( previousUsers.length !== nextUsers.length ) {
			recordTracksEvent( 'calypso_checkout_gsuite_upgrade_users_changed', {
				domain_name: domain,
				next_user_count: nextUsers.length,
				prev_user_count: previousUsers.length,
			} );
		}
	};

	const handleAddEmailClick = () => {
		recordClickEvent( `calypso_checkout_gsuite_upgrade_add_email_button_click` );

		if ( canContinue ) {
			onAddEmailClick( getItemsForCart( [ domain ], gSuiteProductSlug, users ) );
		}
	};

	const handleSkipClick = () => {
		recordClickEvent( `calypso_checkout_gsuite_upgrade_skip_button_click` );

		onSkipClick();
	};

	const handleReturnKeyPress = event => {
		// Simulate an implicit submission for the add user form :)
		if ( event.key === 'Enter' ) {
			handleAddEmailClick();
		}
	};

	const handleUsersChange = changedUsers => {
		recordUsersChangedEvent( users, changedUsers );

		setUsers( changedUsers );
	};

	return (
		<div className="gsuite-upsell-card__form">
			<QueryProducts />

			<CompactCard>
				<header className="gsuite-upsell-card__header">
					<h2 className="gsuite-upsell-card__title">
						{ translate( 'Add Professional email from G Suite by Google Cloud to %(domain)s', {
							args: {
								domain,
							},
						} ) }
					</h2>

					<h5 className="gsuite-upsell-card__no-setup-required">
						{ translate( 'No setup or software required. Easy to manage from your dashboard.' ) }
					</h5>
				</header>
			</CompactCard>

			<CompactCard>
				<GSuiteUpsellProductDetails
					domain={ domain }
					cost={ gSuiteCost }
					currencyCode={ currencyCode }
					plan={ gSuiteProductSlug }
				/>

				<GSuiteNewUserList
					extraValidation={ user => user }
					selectedDomainName={ domain }
					onUsersChange={ handleUsersChange }
					users={ users }
					onReturnKeyPress={ handleReturnKeyPress }
				>
					<div className="gsuite-upsell-card__buttons">
						<Button className="gsuite-upsell-card__skip-button" onClick={ handleSkipClick }>
							{ translate( 'Skip' ) }
						</Button>

						<Button
							className="gsuite-upsell-card__add-email-button"
							primary
							disabled={ ! canContinue }
							onClick={ handleAddEmailClick }
						>
							{ translate( 'Purchase G Suite' ) }
						</Button>
					</div>
				</GSuiteNewUserList>
			</CompactCard>
		</div>
	);
};

GSuiteUpsellCard.propTypes = {
	currencyCode: PropTypes.string,
	domain: PropTypes.string.isRequired,
	gSuiteCost: PropTypes.number,
	gSuiteProductSlug: PropTypes.oneOf( [ 'gapps', 'gapps_unlimited' ] ),
	onAddEmailClick: PropTypes.func.isRequired,
	onSkipClick: PropTypes.func.isRequired,
};

export default connect(
	( state, { gSuiteProductSlug } ) => ( {
		currencyCode: getCurrentUserCurrencyCode( state ),
		gSuiteCost: getProductCost( state, gSuiteProductSlug ),
	} ),
	{ recordTracksEvent: recordTracksEventAction }
)( GSuiteUpsellCard );
