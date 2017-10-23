/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-progress' );
import classNames from 'classnames';

export default React.createClass( {
	displayName: 'Security2faProgressItem',

	componentDidMount: function() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	},

	componentWillUnmount: function() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	},

	noticon: function() {
		var icon = 'noticon-' + this.props.icon;
		return classNames( 'noticon', icon );
	},

	highlight: function() {
		return classNames( {
			'security-2fa-progress__item': true,
			'is-highlighted': this.props.step.isHighlighted,
			'is-completed': this.props.step.isCompleted,
		} );
	},

	render: function() {
		return (
			<div className={ this.highlight() }>
				<span className={ this.noticon() } />
				<label>{ this.props.label } </label>
			</div>
		);
	},
} );
