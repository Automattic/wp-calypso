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
	it( 'should display the anchor when no hover text is provided', () => {
		render(
			<Tooltip id={ tooltipId } activeTooltipId="" setActiveTooltipId={ () => {} }>
				{ tooltipAnchor }
			</Tooltip>
		);
		expect( screen.getByText( tooltipAnchor ) ).toBeInTheDocument();
	} );

	it( 'should display the hover text when the tooltip becomes active', async () => {
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

	it( 'should hide the hover text when the tooltip becomes inactive', async () => {
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
