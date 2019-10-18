/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import JetpackHeader from '..';

export default class JetpackHeaderExample extends PureComponent {
	static displayName = 'JetpackHeaderExample';

	static defaultProps = {
		exampleCode: (
			<div>
				<JetpackHeader />
				<JetpackHeader partnerSlug="dreamhost" />
				<JetpackHeader partnerSlug="pressable" />
				<JetpackHeader partnerSlug="milesweb" />
				<JetpackHeader partnerSlug="bluehost" />
				<JetpackHeader partnerSlug="inmotion" />
				<JetpackHeader partnerSlug="liquidweb" />
				<JetpackHeader partnerSlug="eurodns" />
			</div>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}
