/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { FunctionComponent, useState } from 'react';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import { areAllUsersValid, getItemsForCart, newUsers, GSuiteNewUser } from 'lib/gsuite/new-users';
import GoogleAppsProductDetails from './product-details';
import GSuiteNewUserList from 'components/gsuite/gsuite-new-user-list';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import QueryProducts from 'components/data/query-products-list';
import { getProductCost } from 'state/products-list/selectors';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	currencyCode: string | null;
	domainName: string;
	gsuiteBasicCost: number | null;
	onAddEmailClick: ( cartItems: any[] ) => void;
	onSkipClick: () => void;
	recordTracksEvent: ( name: string, properties: any ) => void;
}

const GSuiteDialog: FunctionComponent< Props > = ( {
	currencyCode,
	domainName,
	gsuiteBasicCost,
	onAddEmailClick,
	onSkipClick,
	recordTracksEvent,
} ) => {
	const [ users, setUsers ] = useState( newUsers( domainName ) );

	const canContinue = areAllUsersValid( users );
	// leave this as a variable for future g suite business support
	const productSlug = 'gapps';
	const translate = useTranslate();

	const domains = [ { name: domainName } ];

	const recordClickEvent = ( eventName: string ) => {
		recordTracksEvent( eventName, {
			domain_name: domainName,
			user_count: users.length,
		} );
	};

	const recordUsersChangedEvent = (
		previousUsers: GSuiteNewUser[],
		nextUsers: GSuiteNewUser[]
	) => {
		if ( previousUsers.length !== nextUsers.length ) {
			recordTracksEvent( 'calypso_checkout_gsuite_upgrade_users_changed', {
				domain_name: domainName,
				next_user_count: nextUsers.length,
				prev_user_count: previousUsers.length,
			} );
		}
	};

	const handleAddEmailClick = () => {
		recordClickEvent( `calypso_checkout_gsuite_upgrade_add_email_button_click` );

		if ( canContinue ) {
			onAddEmailClick( getItemsForCart( domains, productSlug, users ) );
		}
	};

	const handleSkipClick = () => {
		recordClickEvent( `calypso_checkout_gsuite_upgrade_skip_button_click` );
		onSkipClick();
	};

	const handleUsersChange = ( changedUsers: GSuiteNewUser[] ) => {
		recordUsersChangedEvent( users, changedUsers );
		setUsers( changedUsers );
	};

	const renderAddEmailButtonText = () =>
		abtest( 'gSuiteContinueButtonCopy' ) === 'purchase'
			? translate( 'Purchase G Suite' )
			: translate( 'Yes, Add Email \u00BB' );

	return (
		<div className="gsuite-dialog__form">
			<QueryProducts />
			<CompactCard>
				<header className="gsuite-dialog__header">
					<h2 className="gsuite-dialog__title">
						{ translate( 'Add Professional email from G Suite by Google Cloud to %(domain)s', {
							args: {
								domainName,
							},
						} ) }
					</h2>
					<h5 className="gsuite-dialog__no-setup-required">
						{ translate( 'No setup or software required. Easy to manage from your dashboard.' ) }
					</h5>
				</header>
			</CompactCard>
			<CompactCard>
				<GoogleAppsProductDetails
					domain={ domainName }
					cost={ gsuiteBasicCost }
					currencyCode={ currencyCode }
					plan={ productSlug }
				/>
				<GSuiteNewUserList
					domains={ domains }
					extraValidation={ user => user }
					selectedDomainName={ domainName }
					onUsersChange={ handleUsersChange }
					users={ users }
				>
					<div className="gsuite-dialog__buttons">
						<Button onClick={ handleSkipClick }>{ translate( 'Skip' ) }</Button>

						<Button primary disabled={ ! canContinue } onClick={ handleAddEmailClick }>
							{ renderAddEmailButtonText() }
						</Button>
					</div>
				</GSuiteNewUserList>
			</CompactCard>
		</div>
	);
};

export default connect(
	state => ( {
		currencyCode: getCurrentUserCurrencyCode( state ),
		gsuiteBasicCost: getProductCost( state, 'gapps' ),
	} ),
	{ recordTracksEvent: recordTracksEventAction }
)( GSuiteDialog );
