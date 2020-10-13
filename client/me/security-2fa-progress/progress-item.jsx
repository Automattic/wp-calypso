/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';

export default class extends React.Component {
	static displayName = 'Security2faProgressItem';

	render() {
		return (
			<div
				className={ classNames( 'security-2fa-progress__item', {
					'is-highlighted': this.props.step.isHighlighted,
					'is-completed': this.props.step.isCompleted,
				} ) }
			>
				<Gridicon icon={ this.props.icon } />
				<label>{ this.props.label } </label>
			</div>
		);
	}
}
