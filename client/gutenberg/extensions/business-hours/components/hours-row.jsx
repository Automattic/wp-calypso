/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { Component, Fragment } from '@wordpress/element';
import { Button, TextControl, ToggleControl } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const defaultOpen = '09:00';
const defaultClose = '17:00';

class HoursRow extends Component {
	renderOpenRowOrRows = ( rowHours, index ) => {
		const { day, attributes, setAttributes, resetFocus, edit = true } = this.props;
		const { hours } = attributes;
		const { opening, closing } = rowHours;
		return (
			<div className="business-hours__row">
				<dt className={ classNames( day, 'business-hours__day' ) }>
					{ index === 0 && this.renderDayColumn() }
				</dt>
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
												...rowHours,
												opening: value,
											},
										],
									},
								} );
							} }
						/>
					) : (
						opening
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
												...rowHours,
												closing: value,
											},
										],
									},
								} );
							} }
						/>
					) : (
						closing
					) }
				</dd>
				<div className="business-hours__add">
					<Button isSmall isLink onClick={ this.addHours }>
						{ __( 'Add Hours' ) }
					</Button>
				</div>
			</div>
		);
	};
	toggleClosed = nextValue => {
		const { day, attributes, setAttributes } = this.props;
		const { hours } = attributes;
		const todaysHours = isEmpty( hours[ day ][ 0 ] ) ? {} : hours[ day ][ 0 ];
		if ( nextValue ) {
			setAttributes( {
				hours: {
					...hours,
					[ day ]: [
						{
							...todaysHours,
							opening: defaultOpen,
							closing: defaultClose,
						},
					],
				},
			} );
		} else {
			setAttributes( {
				hours: {
					...hours,
					[ day ]: [],
				},
			} );
		}
	};
	addHours = () => {
		alert( 'add hours!' );
	};
	isClosed() {
		const { day, attributes } = this.props;
		const { hours } = attributes;
		return isEmpty( hours[ day ][ 0 ] ) && isEmpty( hours[ day ][ 0 ] );
	}
	renderDayColumn() {
		const { day, edit = true, data } = this.props;
		const { days } = data;
		return (
			<Fragment>
				<span className="business-hours__day-name">{ days[ day ] }</span>
				{ edit && (
					<ToggleControl
						label={ this.isClosed() ? __( 'Closed' ) : __( 'Open' ) }
						checked={ ! this.isClosed() }
						onChange={ this.toggleClosed }
					/>
				) }
			</Fragment>
		);
	}
	renderClosedRow() {
		const { day, edit = true } = this.props;
		return (
			<div className="business-hours__row">
				<dt className={ classNames( day, 'business-hours__day' ) }>{ this.renderDayColumn() }</dt>
				<dd className={ classNames( day, 'closed', 'business-hours__hours' ) }>
					{ ! edit && __( 'CLOSED' ) }
				</dd>
				<div className="business-hours__add">&nbsp;</div>
			</div>
		);
	}
	render() {
		const { day, attributes } = this.props;
		const { hours } = attributes;
		return this.isClosed() ? this.renderClosedRow() : hours[ day ].map( this.renderOpenRowOrRows );
	}
}

export default HoursRow;
