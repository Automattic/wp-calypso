/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { Component } from '@wordpress/element';
import { TextControl, ToggleControl } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class HoursRow extends Component {
	isClosed = () => {
		const { day, attributes } = this.props;
		const { hours } = attributes;
		return isEmpty( hours[ day ][ 0 ] ) && isEmpty( hours[ day ][ 0 ] );
	};
	render() {
		const { day, attributes, setAttributes, resetFocus, edit = true, data } = this.props;
		const { hours } = attributes;
		const todaysHours = isEmpty( hours[ day ][ 0 ] ) ? {} : hours[ day ][ 0 ];
		const { opening, closing } = todaysHours;
		const { days } = data;
		return (
			<div className="business-hours__row">
				<dt className={ classNames( day, 'business-hours__day' ) }>
					<span className="business-hours__day-name">{ days[ day ] }</span>
					{ edit && <ToggleControl label={ this.isClosed() ? __( 'Closed' ) : __( 'Open' ) } /> }
				</dt>
				{ edit || ( hours[ day ].opening && hours[ day ].closing ) ? (
					<dd className={ classNames( day, 'business-hours__hours' ) }>
						{ edit ? (
							<TextControl
								type="time"
								label={ __( 'Opening' ) }
								value={ opening }
								onChange={ value => {
									resetFocus && resetFocus();
									setAttributes( {
										hours: {
											...hours,
											[ day ]: [
												{
													...todaysHours,
													opening: value,
												},
											],
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
								value={ closing }
								onChange={ value => {
									resetFocus && resetFocus();
									setAttributes( {
										hours: {
											...hours,
											[ day ]: [
												{
													...todaysHours,
													closing: value,
												},
											],
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
