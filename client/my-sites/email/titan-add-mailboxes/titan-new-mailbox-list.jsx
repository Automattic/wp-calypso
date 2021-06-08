/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import page from 'page';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import {
	areAllMailboxesAvailable,
	areAllMailboxesValid,
	buildNewTitanMailbox,
	sanitizeEmailSuggestion,
	transformMailboxForCart,
	validateMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import { Button } from '@automattic/components';
import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Gridicon from 'calypso/components/gridicon';
import TitanNewMailbox from './titan-new-mailbox';
import { titanMailMonthly } from 'calypso/lib/cart-values/cart-items';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';

const noop = () => {};

const TitanNewMailboxList = ( {
	cancelButtonClassName = null,
	domainName,
	existingDomainObject = null,
	onCancel = noop,
	onSubmitMailboxList = noop,
	shoppingCartManager,
	shouldCheckAvailability = false,
	showCancelButton = false,
	showLabels = true,
	submitButtonClassName = null,
	submitButtonText,
} ) => {
	const translate = useTranslate();

	const [ mailboxes, setMailboxes ] = useState( [ buildNewTitanMailbox( domainName, false ) ] );
	const [ validatedMailboxUuids, setValidatedMailboxUuids ] = useState( [] );

	const [ isCheckingAvailability, setIsCheckingAvailability ] = useState( false );
	const [ isAddingToCart, setIsAddingToCart ] = useState( false );

	const productsList = useSelector( getProductsList );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const onMailboxValueChange = ( uuid ) => ( fieldName, fieldValue, mailboxFieldTouched ) => {
		const updatedMailboxes = mailboxes.map( ( mailbox ) => {
			if ( mailbox.uuid !== uuid ) {
				return mailbox;
			}

			const updatedMailbox = { ...mailbox, [ fieldName ]: { value: fieldValue, error: null } };

			if ( 'name' === fieldName && ! mailboxFieldTouched ) {
				return {
					...updatedMailbox,
					mailbox: { value: sanitizeEmailSuggestion( fieldValue ), error: null },
				};
			}

			return updatedMailbox;
		} );

		setMailboxes( validateMailboxes( updatedMailboxes ) );
	};

	const onMailboxAdd = () => {
		setMailboxes( [ ...mailboxes, buildNewTitanMailbox( domainName, false ) ] );
	};

	const onMailboxRemove = ( currentMailboxes, uuid ) => () => {
		const remainingMailboxes = currentMailboxes.filter( ( mailbox ) => mailbox.uuid !== uuid );

		const updatedMailboxes =
			0 < remainingMailboxes.length
				? remainingMailboxes
				: [ buildNewTitanMailbox( domainName, false ) ];

		setMailboxes( updatedMailboxes );
	};

	// Effect to add the current set of mailboxes to the cart when isAddingToCart is set to true.
	useEffect( () => {
		if ( ! isAddingToCart ) {
			return;
		}

		let isMounted = true;

		const cartItem = titanMailMonthly( {
			domain: domainName,
			quantity: mailboxes.length,
			extra: {
				email_users: mailboxes.map( transformMailboxForCart ),
				new_quantity: mailboxes.length,
			},
		} );

		shoppingCartManager
			.addProductsToCart( [ fillInSingleCartItemAttributes( cartItem, productsList ) ] )
			.then( ( shoppingCart ) => {
				if ( isMounted ) {
					setIsAddingToCart( false );
				}

				const { errors } = shoppingCart?.messages;
				if ( errors && errors.length ) {
					// Stay on the page to show the relevant error(s)
					return;
				}

				if ( isMounted ) {
					page( '/checkout/' + selectedSiteSlug );
				}
			} );

		return () => {
			isMounted = false;
		};
	}, [ isAddingToCart ] );

	// Effect to trigger availability checks when isCheckingAvailability is true
	useEffect( () => {
		if ( ! isCheckingAvailability ) {
			return;
		}

		let isMounted = true;

		areAllMailboxesAvailable( mailboxes ).then( ( validatedMailboxes ) => {
			if ( isMounted ) {
				setIsCheckingAvailability( false );
				setMailboxes( validatedMailboxes );
				setIsAddingToCart( true );
			}
		} );

		return () => {
			isMounted = false;
		};
	}, [ isCheckingAvailability ] );

	// Submit handler for fully validated mailboxes.
	const submitMailboxes = ( validatedMailboxes ) => {
		const mailboxesAreValid = areAllMailboxesValid( validatedMailboxes );

		const userCanAddEmail = canCurrentUserAddEmail( existingDomainObject );

		onSubmitMailboxList( {
			mailboxCount: validatedMailboxes.length,
			mailboxesAreValid,
			userCanAddEmail,
		} );

		if ( ! mailboxesAreValid || ! userCanAddEmail ) {
			return;
		}

		setIsAddingToCart( true );
	};

	// Pre-submission mailbox validation checks to make sure all mailbox-level errors are identified.
	const validateMailboxesForSubmit = () => {
		const validatedMailboxes = validateMailboxes( mailboxes );

		setValidatedMailboxUuids(
			validatedMailboxes.map( ( validatedMailbox ) => validatedMailbox.uuid )
		);

		if ( ! shouldCheckAvailability ) {
			setMailboxes( validatedMailboxes );
			submitMailboxes( validatedMailboxes );

			return;
		}

		setIsCheckingAvailability( true );
	};

	const onReturnKeyPress = ( event ) => {
		// Simulate form submission
		if ( event.key === 'Enter' ) {
			validateMailboxesForSubmit();
		}
	};

	return (
		<div className="titan-new-mailbox-list__main">
			{ mailboxes.map( ( mailbox, index ) => (
				<TitanNewMailbox
					key={ mailbox.uuid }
					onMailboxAdd={ onMailboxAdd }
					onMailboxRemove={ onMailboxRemove( mailboxes, mailbox.uuid ) }
					onMailboxValueChange={ onMailboxValueChange( mailbox.uuid ) }
					mailbox={ mailbox }
					onReturnKeyPress={ onReturnKeyPress }
					showAllErrors={ validatedMailboxUuids.includes( mailbox.uuid ) }
					showLabels={ showLabels }
					showTrashButton={ index > 0 }
				/>
			) ) }

			<div className="titan-new-mailbox-list__actions">
				<Button className="titan-new-mailbox-list__add-mailbox-button" onClick={ onMailboxAdd }>
					<Gridicon icon="plus" />
					<span>{ translate( 'Add another mailbox' ) }</span>
				</Button>

				{ showCancelButton && (
					<Button
						className={ classNames(
							'titan-new-mailbox-list__cancel-button',
							cancelButtonClassName
						) }
						onClick={ onCancel }
					>
						{ translate( 'Cancel' ) }
					</Button>
				) }

				<Button
					busy={ isAddingToCart || isCheckingAvailability }
					className={ classNames( 'titan-new-mailbox-list__submit-button', submitButtonClassName ) }
					onClick={ validateMailboxesForSubmit }
					primary
				>
					{ submitButtonText }
				</Button>
			</div>
		</div>
	);
};

TitanNewMailboxList.propTypes = {
	cancelButtonClassName: PropTypes.string,
	domainName: PropTypes.string.isRequired,
	existingDomainObject: PropTypes.object,
	onCancel: PropTypes.func,
	onSubmitMailboxList: PropTypes.func,
	shouldCheckAvailability: PropTypes.bool,
	showCancelButton: PropTypes.bool,
	showLabels: PropTypes.bool,
	submitButtonClassName: PropTypes.string,
	submitButtonText: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ).isRequired,

	// Automatically supplied props
	shoppingCartManager: PropTypes.object.isRequired,
};

export default withShoppingCart( TitanNewMailboxList );
