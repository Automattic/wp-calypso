import { Button, Dropdown } from '@wordpress/components';
import React, { useState } from 'react';
import Intervals from 'calypso/blocks/stats-navigation/intervals';
import './style.scss';

const IntervalDropdown = ( { period, pathTemplate } ) => {
	const [ currentInterval, setCurrentInterval ] = useState( period );

	const intervalLabels = {
		day: 'Days',
		week: 'Weeks',
		month: 'Months',
		year: 'Years',
	};

	const getCurrentIntervalLabel = ( intervalValue ) => {
		return intervalLabels[ intervalValue ] || intervalValue;
	};

	return (
		<Dropdown
			className="stats-interval-dropdown"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					className="stats-interval-dropdown__button"
					onClick={ onToggle }
					aria-expanded={ isOpen }
				>
					{ getCurrentIntervalLabel( currentInterval ) }
				</Button>
			) }
			renderContent={ () => (
				<div>
					<Intervals
						className="stats-interval-dropdown__controls"
						selected={ currentInterval }
						pathTemplate={ pathTemplate }
						compact={ false }
						onChange={ setCurrentInterval }
					/>
				</div>
			) }
		/>
	);
};

export default IntervalDropdown;
