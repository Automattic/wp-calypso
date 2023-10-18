import { Button, Dropdown } from '@wordpress/components';
import { check, Icon, chevronDown } from '@wordpress/icons';
import page from 'page';
import qs from 'qs';
import './style.scss';

const IntervalDropdown = ( { slug, period, queryParams } ) => {
	const intervalLabels = {
		day: 'Days',
		week: 'Weeks',
		month: 'Months',
		year: 'Years',
	};

	// New interval listing that preserves date range.
	// TODO: Update class names.
	// TODO: Figure out how to dismiss on select.

	function generateNewLink( newPeriod ) {
		const newRangeQuery = qs.stringify( Object.assign( {}, queryParams, {} ), {
			addQueryPrefix: true,
		} );
		const url = `/stats/${ newPeriod }/${ slug }`;
		return `${ url }${ newRangeQuery }`;
	}

	function getDisplayLabel() {
		return intervalLabels[ period ];
	}

	function onSelectionHandler( interval ) {
		page( generateNewLink( interval ) );
	}

	return (
		<Dropdown
			className="stats-interval-dropdown"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button onClick={ onToggle } aria-expanded={ isOpen }>
					{ getDisplayLabel() }
					<Icon className="gridicon" icon={ chevronDown } />
				</Button>
			) }
			renderContent={ () => (
				<div className="stats-interval-dropdown__container">
					<SuperGroovyPeriodSelector selected={ period } onSelection={ onSelectionHandler } />
				</div>
			) }
		/>
	);
};

function SuperGroovyPeriodSelector( props ) {
	const intervals = [ 'day', 'week', 'month', 'year' ];
	const labels = [ 'Days', 'Weeks', 'Months', 'Years' ];
	function isSelectedItem( interval ) {
		return interval === props.selected;
	}
	function clickHandler( interval ) {
		props.onSelection( interval );
	}
	return (
		<div className="groovy-interval-dropdown">
			<ul className="groovy-interval-dropdown__list">
				{ intervals.map( ( interval, idx ) => (
					<li className="groovy-interval-dropdown__interval" key={ interval }>
						<Button
							onClick={ () => {
								clickHandler( interval );
							} }
						>
							{ labels[ idx ] }
							{ isSelectedItem( interval ) && <Icon icon={ check } /> }
						</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
}

export default IntervalDropdown;
