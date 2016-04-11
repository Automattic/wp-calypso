/**
 * External Dependencies
 */
import React from 'react';

export default React.createClass( {
	displayName: 'PlanFeatureFooter',
	render() {
		return (

			<div className="plan-feature__footer">
				<div className="plan-feature__refunds">
					<span className="plan-feature__footer-title">{ this.translate( 'Easy Refunds' ) }</span>
					<span className="plan-feature__footer-info">
						{ this.translate( 'You can cancel within 30 days for a full refund. No questions asked.' ) }
					</span>
				</div>
				<a className="plan-feature__support" href="/help">
					<span className="plan-feature__footer-title">{ this.translate( 'Get Support' ) }</span>
					<span className="plan-feature__footer-info">
						{ this.translate( 'Need help? Our Happiness Engineers can help you set up your site & answer questions.' ) }
					</span>
				</a>
			</div>
		);
	}
} );
