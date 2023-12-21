import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Dropdown } from '@wordpress/components';
import { check, Icon, chevronDown, lock } from '@wordpress/icons';
import classNames from 'classnames';
import qs from 'qs';
import './style.scss';

const StatsIntervalDropdownListing = ( { selected, onSelection, intervals } ) => {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const isSelectedItem = ( interval ) => {
		return interval === selected;
	};

	const clickHandler = ( interval ) => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';

		if ( intervals[ interval ].isGated ) {
			const events = [
				{
					name: `${ event_from }_stats_interval_dropdown_listing_${ intervals[ interval ].id }_gated_clicked`,
				},
				{
					name: 'jetpack_stats_upsell_clicked',
					params: { statType: intervals[ interval ].statType, source: event_from },
				},
			];
			return intervals[ interval ].onGatedClick( events, event_from );
		}
		onSelection( interval );
	};

	return (
		<div className="stats-interval-dropdown-listing">
			<ul className="stats-interval-dropdown-listing__list" role="radiogroup">
				{ Object.keys( intervals ).map( ( intervalKey ) => {
					const interval = intervals[ intervalKey ];

					return (
						<li
							className={ classNames( 'stats-interval-dropdown-listing__interval', {
								[ 'is-selected' ]: isSelectedItem( intervalKey ),
							} ) }
							key={ intervalKey }
							role="none"
						>
							<Button
								role="radio"
								aria-checked={ isSelectedItem( intervalKey ) }
								onClick={ () => {
									clickHandler( intervalKey );
								} }
							>
								{ interval.label }
								{ isSelectedItem( intervalKey ) && <Icon icon={ check } /> }
								{ interval.isGated && <Icon icon={ lock } /> }
							</Button>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};

const IntervalDropdown = ( { slug, period, queryParams, intervals } ) => {
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
		return intervals[ period ].label;
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
						intervals={ intervals }
					/>
				</div>
			) }
		/>
	);
};

export default IntervalDropdown;
