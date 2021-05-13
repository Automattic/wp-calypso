/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Navbar from './navbar';
import Dropdown from './dropdown';

/**
 * Style dependencies
 */
import './style.scss';

const OptionShape = PropTypes.shape( {
	label: PropTypes.string.isRequired,
	uri: PropTypes.string.isRequired,
	icon: PropTypes.string,
} );

export default class SubMasterbarNav extends Component {
	static propTypes = {
		fallback: OptionShape,
		options: PropTypes.arrayOf( OptionShape ),
		uri: PropTypes.string.isRequired,
	};

	static defaultProps = {
		options: [],
	};

	render() {
		return (
			<div className="sub-masterbar-nav">
				<Dropdown
					selected={ this.getSelected() || this.props.fallback }
					options={ this.props.options }
				/>
				<Navbar selected={ this.getSelected() } options={ this.props.options } />
			</div>
		);
	}

	getSelected() {
		return find( this.props.options, ( option ) => option.uri === this.props.uri );
	}
}
