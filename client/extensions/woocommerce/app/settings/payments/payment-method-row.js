/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ListRowField from '../../../components/list/list-row-field';

const PaymentMethodRow = ( { method, translate } ) => {
	return (
		<tr className="payments__method-row">
			<ListRowField>
				{
					method.suggested &&
					(
						<p className="payments__method-suggested">
							{ translate( 'Suggested Method' ) }
						</p>
					)
				}
				<p>{ method.name }</p>
			</ListRowField>
			<ListRowField>
				<p>{ method.fee }</p>
				<p>
					<a href={ method.information }>
						{ translate( 'More Information' ) }
					</a>
				</p>
			</ListRowField>
			<ListRowField className="payments__setup-column">
				<Button compact>
					{
						translate( 'Set Up' )
					}
				</Button>
			</ListRowField>
		</tr>
	);
};

PaymentMethodRow.propTypes = {
	method: PropTypes.shape( {
		name: PropTypes.string.isRequired,
		suggested: PropTypes.bool.isRequired,
		fee: PropTypes.string.isRequired,
		information: PropTypes.string.isRequired,
	} ),
};

export default localize( PaymentMethodRow );
