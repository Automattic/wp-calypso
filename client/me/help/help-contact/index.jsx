/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import HelpContact from './help-contact';
import { getOlarkState } from 'state/olark/selector';

import {
	expandOlarkBox,
	hideOlarkBox,
	sendOlarkNotificationToOperator,
	shrinkOlarkBox,
	updateOlarkDetails
} from 'state/olark/actions';

function mapStateToProps( state ) {
	return {
		olark: getOlarkState( state ),
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		expandOlarkBox: expandOlarkBox,
		shrinkOlarkBox: shrinkOlarkBox,
		hideOlarkBox: hideOlarkBox,
		sendOlarkNotificationToOperator: sendOlarkNotificationToOperator,
		updateOlarkDetails: () => updateOlarkDetails()( dispatch )
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( HelpContact );
