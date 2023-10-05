import { Button, Dropdown } from '@wordpress/components';
import { check, Icon, chevronDown } from '@wordpress/icons';
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
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button onClick={ onToggle } aria-expanded={ isOpen }>
					{ getCurrentIntervalLabel( currentInterval ) }
					<Icon className="gridicon" icon={ chevronDown } />
				</Button>
			) }
			renderContent={ () => (
				<div className="stats-interval-dropdown__container">
					<Intervals
						selected={ currentInterval }
						pathTemplate={ pathTemplate }
						compact={ false }
						onChange={ setCurrentInterval }
						icon={ check }
					/>
				</div>
			) }
		/>
	);
};

export default IntervalDropdown;
