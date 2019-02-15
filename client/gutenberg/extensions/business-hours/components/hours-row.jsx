/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { Component, Fragment } from '@wordpress/element';
import { IconButton, TextControl, ToggleControl } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const defaultOpen = '09:00';
const defaultClose = '17:00';

class HoursRow extends Component {
	renderOpenedRow = ( rowHours, index ) => {
		const { day, attributes, setAttributes, resetFocus, edit = true } = this.props;
		const { hours } = attributes;
		const { opening, closing } = rowHours;
		return (
			<Fragment>
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
								className="business-hours__open"
								onChange={ value => {
									resetFocus && resetFocus();
									setAttributes( {
										hours: {
											...hours,
											[ day ]: hours[ day ].map( ( daysHours, daysIndex ) => {
												if ( daysIndex === index ) {
													return {
														...daysHours,
														opening: value,
													};
												}
												return daysHours;
											} ),
										},
									} );
								} }
							/>
						) : (
							opening
						) }
						{ edit ? (
							<TextControl
								type="time"
								label={ __( 'Closing' ) }
								value={ closing }
								className="business-hours__close"
								onChange={ value => {
									resetFocus && resetFocus();
									setAttributes( {
										hours: {
											...hours,
											[ day ]: hours[ day ].map( ( daysHours, daysIndex ) => {
												if ( daysIndex === index ) {
													return {
														...daysHours,
														closing: value,
													};
												}
												return daysHours;
											} ),
										},
									} );
								} }
							/>
						) : (
							closing
						) }
					</dd>
					<div className="business-hours__remove">
						{ hours[ day ].length > 1 && (
							<IconButton
								isSmall
								isLink
								icon="trash"
								onClick={ () => {
									this.removeHours( day, index );
								} }
							/>
						) }
					</div>
				</div>
				{ index === hours[ day ].length - 1 && (
					<div className="business-hours__row business-hours-row__add">
						<dt className={ classNames( day, 'business-hours__day' ) }>&nbsp;</dt>
						<dd className={ classNames( day, 'business-hours__hours' ) }>
							<IconButton
								isSmall
								isLink
								label={ __( 'Add Hours' ) }
								icon="plus-alt"
								onClick={ this.addHours }
								data-day={ day }
							>
								{ __( 'Add Hours' ) }
							</IconButton>
						</dd>
						<div className="business-hours__remove">&nbsp;</div>
					</div>
				) }
			</Fragment>
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
	addHours = ( {
		target: {
			dataset: { day },
		},
	} ) => {
		const { attributes, setAttributes } = this.props;
		const { hours } = attributes;
		hours[ day ].push( { opening: '', closing: '' } );
		setAttributes( {
			hours: {
				...hours,
				[ day ]: hours[ day ],
			},
		} );
	};
	removeHours = ( day, index ) => {
		const { attributes, setAttributes } = this.props;
		const { hours } = attributes;
		setAttributes( {
			hours: {
				...hours,
				[ day ]: hours[ day ].filter( ( daysHours, hoursIndex ) => {
					return hoursIndex !== index;
				} ),
			},
		} );
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
			<div className="business-hours__row business-hours-row__closed">
				<dt className={ classNames( day, 'business-hours__day' ) }>{ this.renderDayColumn() }</dt>
				<dd className={ classNames( day, 'closed', 'business-hours__hours' ) }>
					{ ! edit && __( 'CLOSED' ) }
				</dd>
				<div className="business-hours__remove">&nbsp;</div>
			</div>
		);
	}
	render() {
		const { day, attributes } = this.props;
		const { hours } = attributes;
		return this.isClosed() ? this.renderClosedRow() : hours[ day ].map( this.renderOpenedRow );
	}
}

export default HoursRow;
