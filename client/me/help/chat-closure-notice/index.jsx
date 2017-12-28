/**
 * Fixed notice about upcoming support closures
 *
 * @format
 */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'client/components/forms/form-section-heading';
import olarkStore from 'client/lib/olark-store';
import { title, upcoming, closed } from './messages';

const Notice = localize( ( { translate, closedFrom, closedTo, reason } ) => (
	<div className="chat-closure-notice">
		<FormSectionHeading>
			{ title( { translate, closedFrom, closedTo, reason } ) }
		</FormSectionHeading>
		<div>
			{ i18n.moment().isBefore( closedFrom )
				? upcoming( { translate, closedFrom, closedTo, reason } )
				: closed( { translate, closedFrom, closedTo, reason } ) }
		</div>
	</div>
) );

export default class ChatClosureNotice extends Component {
	constructor( props ) {
		super( props );
		this.state = { olark: olarkStore.get() };
	}

	componentDidMount() {
		this.updateOlarkState();
		olarkStore.on( 'change', this.updateOlarkState );
	}

	componentWillUnmount() {
		olarkStore.removeListener( 'change', this.updateOlarkState );
	}

	updateOlarkState = () => {
		this.setState( { olark: olarkStore.get() } );
	};

	render() {
		const closedFrom = i18n.moment( this.props.from );
		const closedTo = i18n.moment( this.props.to );
		// Don't show notice if user isn't eligible for chat
		if ( ! this.state.olark.isUserEligible ) {
			return null;
		}

		// Closure period is over, don't show any notice
		if ( i18n.moment().isAfter( closedTo ) ) {
			return null;
		}

		return <Notice reason={ this.props.reason } closedFrom={ closedFrom } closedTo={ closedTo } />;
	}
}

ChatClosureNotice.PropTypes = {
	from: PropTypes.string.isRequired,
	to: PropTypes.string.isRequired,
};
