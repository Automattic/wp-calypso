/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';

const PaymentMethodItem = ( { method, translate, onCancel, onEdit, currentlyEditingId } ) => {
	let editButtonText = translate( 'Set up' );
	if ( currentlyEditingId === method.id ) {
		editButtonText = translate( 'Cancel' );
	} else {
		editButtonText = translate( 'Set up' );
	}

	const onEditHandler = () => {
		if ( currentlyEditingId === method.id ) {
			onCancel( method );
		} else {
			onEdit( method );
		}
	};

	return (
		<ListItem>
			<ListItemField>
				{
					method.isSuggested &&
					(
						<p className="payments__method-suggested">
							{ translate( 'Suggested Method' ) }
						</p>
					)
				}
				<p className="payments__method-name">{ method.title }</p>
			</ListItemField>
			<ListItemField>
				{ method.fees && (
					<p className="payments__method-information">{ method.fees }</p>
				) }
				{ method.informationUrl && (
					<p className="payments__method-information">
						<a href={ method.informationUrl }>
							{ translate( 'More Information' ) }
						</a>
					</p>
				) }

			</ListItemField>
			<ListItemField>
				<Button compact onClick={ onEditHandler }>
					{
						editButtonText
					}
				</Button>
			</ListItemField>
		</ListItem>
	);
};

PaymentMethodItem.propTypes = {
	currentlyEditingId: PropTypes.string,
	method: PropTypes.shape( {
		title: PropTypes.string.isRequired,
		isSuggested: PropTypes.bool,
		fees: PropTypes.string,
		id: PropTypes.string,
		informationUrl: PropTypes.string,
	} ),
	onCancel: PropTypes.func,
	onEdit: PropTypes.func,
};

export default localize( PaymentMethodItem );
