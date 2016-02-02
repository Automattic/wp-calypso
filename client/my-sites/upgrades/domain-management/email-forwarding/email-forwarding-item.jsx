/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import notices from 'notices';
import * as upgradesActions from 'lib/upgrades/actions';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import { successNotice } from 'state/notices/actions';

const EmailForwardingItem = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	deleteItem: function() {
		const { temporary, domain, mailbox, forward_address, email } = this.props.emailData;

		if ( temporary ) {
			return;
		}

		upgradesActions.deleteEmailForwarding( domain, mailbox, ( error ) => {
			this.recordEvent( 'deleteClick', domain, mailbox, forward_address, ! Boolean( error ) );

			if ( error ) {
				notices.error( error.message );
			} else {
				this.props.successNotice( this.translate( 'Yay, %(email)s has been successfully deleted!', { args: { email: email } } ) );
			}
		} );
	},

	render: function() {
		return (
			<li>
				<Button borderless disabled={ this.props.emailData.temporary } onClick={ this.deleteItem }>
					<Gridicon icon="trash" />
				</Button>
				<span>{ this.translate( '{{strong1}}%(email)s{{/strong1}} {{em}}forwards to{{/em}} {{strong2}}%(forwardTo)s{{/strong2}}',
					{
						components: {
							strong1: <strong />,
							strong2: <strong />,
							em: <em />
						},
						args: {
							email: this.props.emailData.email,
							forwardTo: this.props.emailData.forward_address
						}
					} ) }</span>
			</li>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( EmailForwardingItem );

