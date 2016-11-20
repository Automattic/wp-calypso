/**
 * Fixed notice about upcoming support closures
 */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';
import olarkStore from 'lib/olark-store';

const Closed = localize( ( { translate, closedTo } ) =>
	<div className="help-contact-closure-notice">
		<FormSectionHeading>{ translate( 'Limited Support For Thanksgiving' ) }</FormSectionHeading>
		<p>
			{ translate(
				'Live chat is closed today for the US Thanksgiving holiday. To get in touch, please ' +
				'submit a support request below and we will get to it as fast as we can. Live chat ' +
				'will reopen on {{strong}}%(closed_end_date)s{{/strong}}. Thank you!', {
					args: {
						closed_end_date: closedTo.format( 'dddd, MMMM Do, YYYY HH:mm' ),
					},
					components: {
						strong: <strong />
					}
				}
			) }
		</p>
	</div>
);

const Upcoming = localize( ( { translate, closedFrom, closedTo } ) =>
	<div className="help-contact-closure-notice">
		<FormSectionHeading>{ translate( 'Limited Support For Thanksgiving' ) }</FormSectionHeading>
		<p>
			{ translate(
				'Live chat support will be closed from ' +
				'{{strong}}%(closed_start_date)s{{/strong}} through {{strong}}%(closed_end_date)s{{/strong}} ' +
				'for the US Thanksgiving holiday. If you need to get in touch with us that day, you’ll be able ' +
				'to submit a support request from this page and we will get to it as fast as we can. Thank you!', {
					args: {
						closed_start_date: closedFrom.format( 'dddd, MMMM Do, YYYY HH:mm' ),
						closed_end_date: closedTo.format( 'dddd, MMMM Do, YYYY HH:mm' ),
					},
					components: {
						strong: <strong />
					}
				}
			) }
		</p>
	</div>
);

export default class HelpContactClosureNotice extends Component {
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
	}

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

		// Closure period is upcoming
		if ( i18n.moment().isBefore( closedFrom ) ) {
			return <Upcoming closedFrom={ closedFrom } closedTo={ closedTo } />;
		}

		return <Closed closedFrom={ closedFrom } closedTo={ closedTo } />;
	}
}

HelpContactClosureNotice.PropTypes = {
	from: React.PropTypes.string.isRequired,
	to: React.PropTypes.string.isRequired,
};
