/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { Component, Fragment } from '@wordpress/element';
import { TextControl, ToggleControl } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const defaultOpen = '09:00';
const defaultClose = '17:00';

class HoursRow extends Component {
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
	isClosed() {
		const { day, attributes } = this.props;
		const { hours } = attributes;
		return isEmpty( hours[ day ][ 0 ] ) && isEmpty( hours[ day ][ 0 ] );
	}
	renderClosed() {
		const { edit = true } = this.props;
		return <Fragment>{ ! edit && __( 'CLOSED' ) }</Fragment>;
	}
	renderOpened() {
		const { day, attributes, setAttributes, resetFocus, edit = true } = this.props;
		const { hours } = attributes;
		const todaysHours = isEmpty( hours[ day ][ 0 ] ) ? {} : hours[ day ][ 0 ];
		const { opening, closing } = todaysHours;
		return (
			<Fragment>
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
											...todaysHours,
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
			</Fragment>
		);
	}
	render() {
		const { day, edit = true, data } = this.props;
		const { days } = data;
		return (
			<div className="business-hours__row">
				<dt className={ classNames( day, 'business-hours__day' ) }>
					<span className="business-hours__day-name">{ days[ day ] }</span>
					{ edit && (
						<ToggleControl
							label={ this.isClosed() ? __( 'Closed' ) : __( 'Open' ) }
							checked={ ! this.isClosed() }
							onChange={ this.toggleClosed }
						/>
					) }
				</dt>
				<dd className={ classNames( day, { closed: this.isClosed() }, 'business-hours__hours' ) }>
					{ this.isClosed() ? this.renderClosed() : this.renderOpened() }
				</dd>
			</div>
		);
	}
}

export default HoursRow;
