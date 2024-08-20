/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Tooltip from '../shared/tooltip';

const tooltipId = 'tooltip-123';
const tooltipAnchor = 'Hover me';
const tooltipHoverText = 'Wow, that was fun';

describe( 'Tooltip', () => {
	it( 'should display the anchor', () => {
		render(
			<Tooltip id={ tooltipId } activeTooltipId="" setActiveTooltipId={ () => {} }>
				{ tooltipAnchor }
			</Tooltip>
		);
		expect( screen.getByText( tooltipAnchor ) ).toBeInTheDocument();
	} );

	it( 'should display the tooltip hover text when it becomes active', async () => {
		// Initially inactive
		const { rerender } = render(
			<Tooltip
				id={ tooltipId }
				activeTooltipId=""
				text={ tooltipHoverText }
				setActiveTooltipId={ () => {} }
			>
				{ tooltipAnchor }
			</Tooltip>
		);
		// Becomes active
		rerender(
			<Tooltip
				id={ tooltipId }
				activeTooltipId={ tooltipId }
				text={ tooltipHoverText }
				setActiveTooltipId={ () => {} }
			>
				{ tooltipAnchor }
			</Tooltip>
		);
		await waitFor( () => {
			expect( screen.getByText( tooltipHoverText ) ).toBeInTheDocument();
		} );
	} );

	it( 'should hide the tooltip hover text when it becomes inactive', async () => {
		// Initially active
		const { rerender } = render(
			<Tooltip
				id={ tooltipId }
				activeTooltipId="tooltipId"
				text={ tooltipHoverText }
				setActiveTooltipId={ () => {} }
			>
				{ tooltipAnchor }
			</Tooltip>
		);
		// Becomes inactive
		rerender(
			<Tooltip
				id={ tooltipId }
				activeTooltipId=""
				text={ tooltipHoverText }
				setActiveTooltipId={ () => {} }
			>
				{ tooltipAnchor }
			</Tooltip>
		);
		await waitFor( () => {
			expect( screen.queryByText( tooltipHoverText ) ).not.toBeInTheDocument();
		} );
	} );
} );
