/** @format */

/**
 * External dependencies
 */

import { Fragment, Component } from '@wordpress/element';
import { TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class HoursRow extends Component {
	render() {
		const { day, hours, setAttributes, resetFocus, edit = true, data } = this.props;
		const { days } = data;
		return (
			<Fragment>
				<dt className={ day }>{ days[ day ] }</dt>
				{ edit || ( hours[ day ].opening && hours[ day ].closing ) ? (
					<dd className={ day }>
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
					<dd className={ day + ' closed' }>{ __( 'CLOSED' ) }</dd>
				) }
			</Fragment>
		);
	}
}

export default HoursRow;
