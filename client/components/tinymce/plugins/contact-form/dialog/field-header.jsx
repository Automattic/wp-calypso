/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import getLabel from './locales';

export default React.createClass( {
	displayName: 'ContactFormDialogFieldHeader',

	propTypes: {
		label: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		options: PropTypes.string,
		required: PropTypes.bool,
	},

	getLegend() {
		if ( this.props.options ) {
			const count = this.props.options.split( ',' ).length;

			if ( this.props.required ) {
				return this.translate(
					'Required field "%(fieldName)s" with %(numOption)d option',
					'Required field "%(fieldName)s" with %(numOption)d options', {
						count,
						args: {
							fieldName: getLabel( this.props.type ),
							numOption: count
						},
						comment: 'Explains to the user the field settings. If required, type, and how many options it has.'
					} );
			}

			return this.translate(
				'Optional field "%(fieldName)s" with %(numOption)d option',
				'Optional field "%(fieldName)s" with %(numOption)d options', {
					count,
					args: {
						fieldName: getLabel( this.props.type ),
						numOption: count
					},
					comment: 'Explains to the user the field settings. If required, type, and how many options it has.'
				} );
		}

		if ( this.props.required ) {
			return this.translate( 'Required field "%(fieldName)s"', {
				args: {
					fieldName: getLabel( this.props.type )
				},
				comment: 'Explain to the user the field settings for fields other than dropdown and select list.'
			} );
		}

		return this.translate( 'Optional field "%(fieldName)s"', {
			args: {
				fieldName: getLabel( this.props.type )
			},
			comment: 'Explain to the user the field settings for fields other than dropdown and select list.'
		} );
	},

	render() {
		return (
			<div>
				<div>{ this.props.label }</div>
				<div><small>{ this.getLegend() }</small></div>
			</div>
		);
	}
} );
