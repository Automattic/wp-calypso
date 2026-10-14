/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import BriefDirection from '../brief-direction';
import type { DesignBrief } from '../api';

test( 'keeps every expressed design field in the native brief card', () => {
	const brief: DesignBrief = {
		goal: 'Help readers discover the archive',
		style: 'Calm editorial typography',
		audience: 'Returning readers',
		mood_keywords: [ 'quiet', 'clear' ],
		typography: { headings: 'Readable serif', body: 'Simple sans serif' },
		palette: { description: 'Warm paper and blue ink', colors: [ '#fafafa', '#3858e9' ] },
		references: [ 'A reading room', 'An editorial index' ],
	};
	render(
		<BriefDirection brief={ brief } pending>
			<span>Review actions</span>
		</BriefDirection>
	);
	for ( const value of [
		brief.goal,
		brief.style,
		brief.audience!,
		...brief.mood_keywords!,
		brief.typography!.headings!,
		brief.typography!.body!,
		brief.palette!.description!,
		...brief.palette!.colors!.map( ( color ) => color.toUpperCase() ),
		...brief.references!,
	] ) {
		expect( screen.getByText( value, { exact: true } ) ).toBeVisible();
	}
	expect( screen.getByRole( 'heading', { name: 'Design brief', level: 1 } ) ).toBeVisible();
	expect( screen.getByRole( 'heading', { name: brief.goal, level: 2 } ) ).toBeVisible();
	expect( screen.getByRole( 'group', { name: 'The palette' } ) ).toHaveTextContent( '#3858E9' );
	expect( screen.getByText( 'Ready to generate' ) ).toBeVisible();
	expect( screen.getByText( 'Review actions' ) ).toBeVisible();
} );

test( 'omits unexpressed optional fields and marks an already-built brief', () => {
	render(
		<BriefDirection brief={ { goal: 'Find articles', style: 'Blue and white' } } pending={ false }>
			<span>Use design</span>
		</BriefDirection>
	);
	for ( const label of [ 'The feeling', 'The type', 'The palette', 'Audience', 'References' ] ) {
		expect( screen.queryByRole( 'group', { name: label } ) ).toBeNull();
	}
	expect( screen.getByText( 'Behind your new design' ) ).toBeVisible();
	expect( screen.queryByText( 'Ready to generate' ) ).toBeNull();
} );
