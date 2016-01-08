/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

const PlanOverviewNotice = React.createClass( {
	propTypes: {
		destinationType: React.PropTypes.string,
		plan: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			dismissed: false
		};
	},

	dismissNotice() {
		this.setState( { dismissed: true } );
	},

	render() {
		if ( ! this.state.dismissed && 'thank-you' === this.props.destinationType ) {
			return (
				<Notice onDismissClick={ this.dismissNotice } status="is-success">
					{
						this.translate( 'Hooray, you just started your 14 day free trial of %(planName)s. Enjoy!', {
							args: { planName: this.props.plan.productName }
						} )
					}
				</Notice>
			);
		}

		return null;
	}
} );

export default PlanOverviewNotice;
