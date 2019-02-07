/**
 * External dependencies
 */

import { Component } from '@wordpress/element';
import { TextControl, ToggleControl } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class HoursRow extends Component {
	render() {
		const { day, attributes, setAttributes, resetFocus, edit = true, data } = this.props;
		const { hours } = attributes;
		const { days } = data;
		return (
			<div className="business-hours__row">
				<dt className={ classNames( day, 'business-hours__day' ) }>
					<span className="business-hours__day-name">{ days[ day ] }</span>
					{ edit && <ToggleControl label="open" /> }
				</dt>
				{ edit || ( hours[ day ].opening && hours[ day ].closing ) ? (
					<dd className={ classNames( day, 'business-hours__hours' ) }>
						{ edit ? (
							<TextControl
								type="time"
								label={ __( 'Opening' ) }
								value={ hours[ day ].opening }
								onChange={ value => {
									resetFocus && resetFocus();
									setAttributes( {
										hours: {
											...hours,
											[ day ]: {
												...hours[ day ],
												opening: value,
											},
										},
									} );
								} }
							/>
						) : (
							hours[ day ].opening
						) }
						&nbsp;&mdash;&nbsp;
						{ edit ? (
							<TextControl
								type="time"
								label={ __( 'Closing' ) }
								value={ hours[ day ].closing }
								onChange={ value => {
									resetFocus && resetFocus();
									setAttributes( {
										hours: {
											...hours,
											[ day ]: {
												...hours[ day ],
												closing: value,
											},
										},
									} );
								} }
							/>
						) : (
							hours[ day ].closing
						) }
					</dd>
				) : (
					<dd className={ classNames( day, 'closed', 'business-hours__hours' ) }>
						{ __( 'CLOSED' ) }
					</dd>
				) }
			</div>
		);
	}
}

export default HoursRow;
