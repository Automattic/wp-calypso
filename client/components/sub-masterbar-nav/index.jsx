/**
 * External dependencies
 */
import { find } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Dropdown from './dropdown';
import Navbar from './navbar';

const OptionShape = PropTypes.shape( {
	label: PropTypes.string.isRequired,
	uri: PropTypes.string.isRequired,
	icon: PropTypes.string
} );

export default class SubMasterbarNav extends Component {
	static propTypes = {
		fallback: OptionShape,
		options: PropTypes.arrayOf( OptionShape ),
		uri: PropTypes.string.isRequired
	};

	static defaultProps = {
		options: []
	}

	render() {
		return (
			<div className="sub-masterbar-nav">
				<Dropdown selected={ this.getSelected() || this.props.fallback } options={ this.props.options } />
				<Navbar selected={ this.getSelected() } options={ this.props.options } />
			</div>
		);
	}

	getSelected() {
		return find( this.props.options, ( option ) => option.uri === this.props.uri );
	}
}
