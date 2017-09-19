/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { assign, noop } from 'lodash';

export default React.createClass( {
	displayName: 'TrackInputChanges',

	propTypes: {
		onNewValue: PropTypes.func
	},

	getDefaultProps() {
		return {
			onNewValue: noop
		};
	},

	componentWillMount() {
		this.inputEdited = false;
	},

	onInputChange( /*event*/ ) {
		this.inputEdited = true;
	},

	onInputBlur( event ) {
		if ( this.inputEdited ) {
			this.props.onNewValue( event );
			this.inputEdited = false;
		}
	},

	render() {
		// Multiple children not supported
		const child = React.Children.only( this.props.children );

		const props = assign( {}, child.props, {
			onChange: event => {
				if ( typeof child.props.onChange === 'function' ) {
					child.props.onChange.call( child, event );
				}
				this.onInputChange( event );
			},
			onBlur: event => {
				if ( typeof child.props.onBlur === 'function' ) {
					child.props.onBlur.call( child, event );
				}
				this.onInputBlur( event );
			}
		} );

		return React.cloneElement( child, props );
	}
} );
