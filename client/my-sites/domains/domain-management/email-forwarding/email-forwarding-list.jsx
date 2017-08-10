/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var EmailForwardingItem = require( './email-forwarding-item' );

class EmailForwardingList extends React.Component {
    render() {
		var emailForwardingItems,
			{ list, hasLoadedFromServer } = this.props.emailForwarding;

		if ( ! list && ! hasLoadedFromServer ) {
			return <span>{ this.props.translate( 'Loading…' ) }</span>;
		}

		if ( ! list ) {
			return null;
		}

		emailForwardingItems = list.map( ( emailForwarding ) => {
			return (
				<EmailForwardingItem
					key={ emailForwarding.email }
					emailData={ emailForwarding }
					selectedSite={ this.props.selectedSite }
					/>
			);
		} );

		return <ul className="email-forwarding__list">{ emailForwardingItems }</ul>;
	}
}

module.exports = localize(EmailForwardingList);
