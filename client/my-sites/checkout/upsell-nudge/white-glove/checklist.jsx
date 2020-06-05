/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import Gridicon from 'components/gridicon';

export class Checklist extends PureComponent {
	render() {
		return (
			<div className="checklist">
				<Gridicon icon="checkmark" className="checklist__icon" />

				<div className="checklist__content">{ this.props.content }</div>
			</div>
		);
	}
}

export default Checklist;
