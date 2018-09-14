/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import { localize, moment } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { isEmpty } from 'lodash';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import DatePicker from 'components/date-picker';
import Popover from 'components/popover';

export class DateRangeSelector extends Component {
	constructor( props ) {
		super( props );
		this.dateRangeButton = React.createRef();
	}

	getFormatedFromDate = ( from, to ) => {
		if ( ! from ) {
			return null;
		}

		if ( ! to ) {
			return from.format( 'LL' );
		}

		// Same day Selected
		if ( from.format( 'YYYY-MM-DD' ) === to.format( 'YYYY-MM-DD' ) ) {
			return '';
		}
		// Same Month selected
		if ( from.format( 'YYYY-MM' ) === to.format( 'YYYY-MM' ) ) {
			return '';
		}

		// Same Year Selected
		if ( from.format( 'YYYY' ) === to.format( 'YYYY' ) ) {
			return from.format( 'MMM D' );
		}
		return from.format( 'll' );
	};

	getFormatedToDate = ( from, to ) => {
		if ( ! to ) {
			return null;
		}
		if ( from.format( 'YYYY-MM-DD' ) === to.format( 'YYYY-MM-DD' ) ) {
			return to.format( 'll' );
		}

		if ( from.format( 'YYYY-MM' ) === to.format( 'YYYY-MM' ) ) {
			return `${ from.format( 'MMM D' ) } – ${ to.format( 'D, YYYY' ) }`;
		}

		return to.format( 'll' );
	};

	getFromatedDate = ( from, to ) => {
		const { translate } = this.props;
		const fromMoment = from ? moment( from ) : null;
		const toMoment = to ? moment( to ) : null;
		const fromFormated = this.getFormatedFromDate( fromMoment, toMoment );
		const toFormated = this.getFormatedToDate( fromMoment, toMoment );

		if ( fromFormated && ! toFormated ) {
			return fromFormated;
		}

		if ( ! isEmpty( fromFormated ) && toFormated ) {
			return `${ fromFormated } – ${ toFormated }`;
		}

		if ( toFormated ) {
			return `${ toFormated }`;
		}

		return translate( 'Date Range' );
	};

	render() {
		const {
			translate,
			isVisible,
			onButtonClick,
			onClose,
			from,
			to,
			enteredTo,
			onDayClick,
			onDayMouseEnter,
			onResetSelection,
			onClearSelection,
		} = this.props;
		const modifiers = { start: from, end: enteredTo };
		const disabledDays = [ { after: new Date() } ];
		const selectedDays = [ from, { from, to: enteredTo } ];

		const buttonClass = classnames( {
			filterbar__selection: true,
			'is-selected': !! from,
		} );
		return (
			<Fragment>
				<Button
					className={ buttonClass }
					compact
					borderless
					onClick={ onButtonClick }
					ref={ this.dateRangeButton }
				>
					{ this.getFromatedDate( from, to ) }
				</Button>
				{ ( from || to ) && (
					<Button
						className="filterbar__selection-close"
						compact
						borderless
						onClick={ onResetSelection }
					>
						<Gridicon icon="cross-small" />
					</Button>
				) }
				<Popover
					id="filterbar__date-range"
					isVisible={ isVisible }
					onClose={ onClose }
					autoPosition={ true }
					context={ this.dateRangeButton.current }
				>
					<div className="filterbar__date-range-wrap">
						<DatePicker
							fromMonth={ from }
							selectedDays={ selectedDays }
							disabledDays={ disabledDays }
							modifiers={ modifiers }
							onSelectDay={ onDayClick }
							onDayMouseEnter={ onDayMouseEnter }
						/>
						<div className="filterbar__date-range-selection-info">
							<div className="filterbar__date-range-info">
								{ ! from &&
									! to &&
									translate( '{{icon/}} Please select the first day.', {
										components: { icon: <Gridicon icon="info" /> },
									} ) }
								{ from &&
									! to &&
									translate( '{{icon/}} Please select the last day.', {
										components: { icon: <Gridicon icon="info" /> },
									} ) }
								{ from &&
									to && (
										<Button borderless compact onClick={ onClearSelection }>
											{ translate( '{{icon/}} clear dates', {
												components: { icon: <Gridicon icon="cross-small" /> },
											} ) }
										</Button>
									) }
							</div>
							<Button
								className="filterbar__date-range-apply"
								primary
								compact
								onClick={ onClose }
								disabled={ ! from }
							>
								{ translate( 'Apply' ) }
							</Button>
						</div>
					</div>
				</Popover>
			</Fragment>
		);
	}
}

export default localize( DateRangeSelector );
