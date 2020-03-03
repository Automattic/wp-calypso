/**
 * External dependencies
 */

import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-progress' );
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

export default class extends React.Component {
	static displayName = 'Security2faProgressItem';

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	}

	highlight = () => {
		return classNames( {
			'security-2fa-progress__item': true,
			'is-highlighted': this.props.step.isHighlighted,
			'is-completed': this.props.step.isCompleted,
		} );
	};

	render() {
		return (
			<div className={ this.highlight() }>
				<Gridicon icon={ this.props.icon } />
				<label>{ this.props.label } </label>
			</div>
		);
	}
}
