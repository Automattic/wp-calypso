/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ListItem from '../../../components/list/list-item';
import ListItemField from '../../../components/list/list-item-field';

const PaymentMethodItem = ( { method, translate } ) => {
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
				<p className="payments__method-name">{ method.label }</p>
			</ListItemField>
			<ListItemField>
				<p className="payments__method-information">{ method.fee }</p>
				<p className="payments__method-information">
					<a href={ method.information }>
						{ translate( 'More Information' ) }
					</a>
				</p>
			</ListItemField>
			<ListItemField>
				<Button compact>
					{
						translate( 'Set Up' )
					}
				</Button>
			</ListItemField>
		</ListItem>
	);
};

PaymentMethodItem.propTypes = {
	method: PropTypes.shape( {
		label: PropTypes.string.isRequired,
		isSuggested: PropTypes.bool.isRequired,
		fee: PropTypes.string.isRequired,
		informationUrl: PropTypes.string.isRequired,
	} ),
};

export default localize( PaymentMethodItem );
