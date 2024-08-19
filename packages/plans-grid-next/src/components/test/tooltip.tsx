/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import Tooltip from '../shared/tooltip';

jest.mock( '@automattic/components', () => ( {
	Tooltip: ( { children, isVisible } ) => ( isVisible ? children : null ),
} ) );

const tooltipId = 'tooltip-123';
const tooltipAnchor = 'Hover me';
const tooltipText = 'Wow, that was fun';

describe( 'Tooltip', () => {
	it( 'should display the anchor', () => {
		render(
			<Tooltip id={ tooltipId } activeTooltipId="" setActiveTooltipId={ () => {} }>
				{ tooltipAnchor }
			</Tooltip>
		);
		expect( screen.getByText( tooltipAnchor ) ).toBeInTheDocument();
	} );

	it( 'should display the tooltip text when active', async () => {
		render(
			<Tooltip
				id={ tooltipId }
				activeTooltipId={ tooltipId }
				text={ tooltipText }
				setActiveTooltipId={ () => {} }
			>
				{ tooltipAnchor }
			</Tooltip>
		);
		expect( screen.getByText( tooltipText ) ).toBeInTheDocument();
	} );

	it( 'should not display the tooltip text when inactive', async () => {
		render(
			<Tooltip
				id={ tooltipId }
				activeTooltipId="another-tooltip-123"
				text={ tooltipText }
				setActiveTooltipId={ () => {} }
			>
				{ tooltipAnchor }
			</Tooltip>
		);
		expect( screen.queryByText( tooltipText ) ).not.toBeInTheDocument();
	} );
} );
