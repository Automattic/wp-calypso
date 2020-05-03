/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import getLabel from './locales';

class ContactFormDialogFieldHeader extends React.Component {
	static displayName = 'ContactFormDialogFieldHeader';

	static propTypes = {
		label: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		options: PropTypes.string,
		required: PropTypes.bool,
	};

	getLegend = () => {
		if ( this.props.options ) {
			const count = this.props.options.split( ',' ).length;

			if ( this.props.required ) {
				return this.props.translate(
					'Required field "%(fieldName)s" with %(numOption)d option',
					'Required field "%(fieldName)s" with %(numOption)d options',
					{
						count,
						args: {
							fieldName: getLabel( this.props.type ),
							numOption: count,
						},
						comment:
							'Explains to the user the field settings. If required, type, and how many options it has.',
					}
				);
			}

			return this.props.translate(
				'Optional field "%(fieldName)s" with %(numOption)d option',
				'Optional field "%(fieldName)s" with %(numOption)d options',
				{
					count,
					args: {
						fieldName: getLabel( this.props.type ),
						numOption: count,
					},
					comment:
						'Explains to the user the field settings. If required, type, and how many options it has.',
				}
			);
		}

		if ( this.props.required ) {
			return this.props.translate( 'Required field "%(fieldName)s"', {
				args: {
					fieldName: getLabel( this.props.type ),
				},
				comment:
					'Explain to the user the field settings for fields other than dropdown and select list.',
			} );
		}

		return this.props.translate( 'Optional field "%(fieldName)s"', {
			args: {
				fieldName: getLabel( this.props.type ),
			},
			comment:
				'Explain to the user the field settings for fields other than dropdown and select list.',
		} );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="editor-contact-form-modal-field-header">
				<div>{ this.props.label }</div>
				<div>
					<small>{ this.getLegend() }</small>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ContactFormDialogFieldHeader );
