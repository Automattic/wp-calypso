import { Button, Dropdown } from '@wordpress/components';
import { check, Icon, chevronDown } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import qs from 'qs';
import './style.scss';

const StatsIntervalDropdownListing = ( { selected, onSelection, intervals } ) => {
	const isSelectedItem = ( interval ) => {
		return interval === selected;
	};

	const clickHandler = ( interval ) => {
		onSelection( interval );
	};

	return (
		<div className="stats-interval-dropdown-listing">
			<ul className="stats-interval-dropdown-listing__list">
				{ Object.keys( intervals ).map( ( intervalKey ) => {
					const intervalLabel = intervals[ intervalKey ];

					return (
						<li className="stats-interval-dropdown-listing__interval" key={ intervalKey }>
							<Button
								onClick={ () => {
									clickHandler( intervalKey );
								} }
							>
								{ intervalLabel }
								{ isSelectedItem( intervalKey ) && <Icon icon={ check } /> }
							</Button>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};

const IntervalDropdown = ( { slug, period, queryParams } ) => {
	const translate = useTranslate();

	const intervalLabels = {
		day: translate( 'Days' ),
		week: translate( 'Weeks' ),
		month: translate( 'Months' ),
		year: translate( 'Years' ),
	};

	// New interval listing that preserves date range.
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
					<StatsIntervalDropdownListing
						selected={ period }
						onSelection={ onSelectionHandler }
						intervals={ intervalLabels }
					/>
				</div>
			) }
		/>
	);
};

export default IntervalDropdown;
