/**
 * External dependencies
 *
 * @format
 */

import { map } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

const ValidationErrorList = React.createClass( {
	displayName: 'ValidationErrorList',

	propTypes: {
		messages: PropTypes.array.isRequired,
	},

	render: function() {
		return (
			<div>
				<p>
					{ this.props.translate(
						'Please correct the issue below and try again.',
						'Please correct the issues listed below and try again.',
						{
							count: this.props.messages.length,
						}
					) }
				</p>
				<ul>
					{ map( this.props.messages, function( message, index ) {
						return <li key={ index }>{ message }</li>;
					} ) }
				</ul>
			</div>
		);
	},
} );

export default localize(ValidationErrorList);
