/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ListTd from '../../../components/list/list-td';

const PaymentMethodRow = ( { method, translate } ) => {
	return (
		<tr className="payments__method-row">
			<ListTd>
				{
					method.suggested &&
					(
						<p className="payments__method-suggested">
							{ translate( 'Suggested Method' ) }
						</p>
					)
				}
				<p>{ method.name }</p>
			</ListTd>
			<ListTd>
				<p>{ method.fee }</p>
				<p>
					<a href={ method.information }>
						{ translate( 'More Information' ) }
					</a>
				</p>
			</ListTd>
			<ListTd>
				<Button>
					{
						translate( 'Set Up' )
					}
				</Button>
			</ListTd>
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
