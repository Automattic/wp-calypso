import { Button, Dropdown } from '@wordpress/components';
import React, { useState } from 'react';
import Intervals from 'calypso/blocks/stats-navigation/intervals';

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
				<Button className="interval-dropdown" onClick={ onToggle } aria-expanded={ isOpen }>
					{ getCurrentIntervalLabel( currentInterval ) }
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<div>
					<Intervals
						selected={ currentInterval }
						pathTemplate={ pathTemplate }
						compact={ false }
						onChange={ setCurrentInterval }
					/>
					<Button variant="secondary" onClick={ onClose }>
						Close
					</Button>
				</div>
			) }
		/>
	);
};

export default IntervalDropdown;
