/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import TableRowField from '../../../components/table/table-row-field';

const PaymentMethodRow = ( { method, translate } ) => {
	return (
		<tr className="payments__method-row">
			<TableRowField>
				{
					method.isSuggested &&
					(
						<p className="payments__method-suggested">
							{ translate( 'Suggested Method' ) }
						</p>
					)
				}
				<p>{ method.label }</p>
			</TableRowField>
			<TableRowField>
				<p>{ method.fee }</p>
				<p>
					<a href={ method.information }>
						{ translate( 'More Information' ) }
					</a>
				</p>
			</TableRowField>
			<TableRowField className="payments__setup-column">
				<Button compact>
					{
						translate( 'Set Up' )
					}
				</Button>
			</TableRowField>
		</tr>
	);
};

PaymentMethodRow.propTypes = {
	method: PropTypes.shape( {
		label: PropTypes.string.isRequired,
		isSuggested: PropTypes.bool.isRequired,
		fee: PropTypes.string.isRequired,
		informationUrl: PropTypes.string.isRequired,
	} ),
};

export default localize( PaymentMethodRow );
