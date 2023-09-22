import { Button, Dropdown } from '@wordpress/components';
import React from 'react';
import Intervals from 'calypso/blocks/stats-navigation/intervals';

const IntervalDropdown = ( { period, pathTemplate } ) => {
	return (
		<Dropdown
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button onClick={ onToggle } aria-expanded={ isOpen }>
					Toggle Dropdown
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<div>
					<Intervals selected={ period } pathTemplate={ pathTemplate } compact={ false } />
					<Button variant="secondary" onClick={ onClose }>
						Close
					</Button>
				</div>
			) }
		/>
	);
};

export default IntervalDropdown;
