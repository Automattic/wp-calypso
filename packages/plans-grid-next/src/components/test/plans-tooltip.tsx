/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import PlansTooltip from '../shared/plans-tooltip';

jest.mock( '@automattic/components', () => ( {
	Tooltip: ( { children, isVisible } ) => ( isVisible ? children : null ),
} ) );

const tooltipId = 'tooltip-123';
const tooltipAnchor = 'Hover me';
const tooltipText = 'Wow, that was fun';

describe( 'PlansTooltip', () => {
	it( 'should display the anchor', () => {
		render(
			<PlansTooltip id={ tooltipId } activeTooltipId="" setActiveTooltipId={ () => {} }>
				{ tooltipAnchor }
			</PlansTooltip>
		);
		expect( screen.getByText( tooltipAnchor ) ).toBeInTheDocument();
	} );

	it( 'should display the tooltip text when active', async () => {
		render(
			<PlansTooltip
				id={ tooltipId }
				activeTooltipId={ tooltipId }
				text={ tooltipText }
				setActiveTooltipId={ () => {} }
			>
				{ tooltipAnchor }
			</PlansTooltip>
		);
		expect( screen.getByText( tooltipText ) ).toBeInTheDocument();
	} );

	it( 'should not display the tooltip text when inactive', async () => {
		render(
			<PlansTooltip
				id={ tooltipId }
				activeTooltipId="another-tooltip-123"
				text={ tooltipText }
				setActiveTooltipId={ () => {} }
			>
				{ tooltipAnchor }
			</PlansTooltip>
		);
		expect( screen.queryByText( tooltipText ) ).not.toBeInTheDocument();
	} );
} );
