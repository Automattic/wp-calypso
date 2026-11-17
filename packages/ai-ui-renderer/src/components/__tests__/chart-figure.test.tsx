import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createPortal } from '@wordpress/element';
import { ChartFigure } from '../chart-figure';

// The library focuses a tooltip it portals to the end of the page, as this one does.
function FigureWithTooltip( { isOpen }: { isOpen: boolean } ) {
	return (
		<ChartFigure title="Stats" table={ { headings: [], rows: [] } }>
			{ /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the library's chart is focusable like this */ }
			<div role="application" tabIndex={ 0 } aria-label="Chart" />
			{ isOpen && createPortal( <div role="tooltip" tabIndex={ -1 } />, document.body ) }
		</ChartFigure>
	);
}

it( 'returns focus from a chart’s tooltip to the chart on Tab', () => {
	render( <FigureWithTooltip isOpen /> );

	const tooltip = screen.getByRole( 'tooltip' );

	tooltip.focus();
	fireEvent.keyDown( tooltip, { key: 'Tab' } );

	expect( screen.getByRole( 'application' ) ).toHaveFocus();
} );

it( 'returns focus to a chart when its tooltip closes', async () => {
	const { rerender } = render( <FigureWithTooltip isOpen /> );

	const tooltip = screen.getByRole( 'tooltip' );

	tooltip.focus();
	fireEvent.keyDown( tooltip, { key: 'Escape' } );
	rerender( <FigureWithTooltip isOpen={ false } /> );

	await waitFor( () => expect( screen.getByRole( 'application' ) ).toHaveFocus() );
} );
