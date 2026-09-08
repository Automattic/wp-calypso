/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MigrationWizardProgress } from '..';

const STEPS = [
	{ slug: 'site-migration-identify', label: 'Your site' },
	{ slug: 'site-migration-scan', label: 'Scan' },
	{ slug: 'site-migration-destination', label: 'Choose' },
	{ slug: 'site-migration-preview', label: 'Preview' },
	{ slug: 'site-migration-domain', label: 'Domain' },
	{ slug: 'site-migration-seo', label: 'SEO' },
	{ slug: 'site-migration-review', label: 'Review' },
];

describe( 'MigrationWizardProgress', () => {
	it( 'announces the position of the current step', () => {
		render( <MigrationWizardProgress steps={ STEPS } current="site-migration-scan" /> );

		const bar = screen.getByRole( 'progressbar', { name: 'Migration progress' } );

		expect( bar ).toBeVisible();
		expect( bar ).toHaveAttribute( 'aria-valuenow', '2' );
		expect( bar ).toHaveAttribute( 'aria-valuemin', '1' );
		expect( bar ).toHaveAttribute( 'aria-valuemax', '7' );
		expect( bar ).toHaveAttribute( 'aria-valuetext', 'Step 2 of 7: Scan' );
	} );

	it( 'shows the counter and the label of every step', () => {
		render( <MigrationWizardProgress steps={ STEPS } current="site-migration-scan" /> );

		expect( screen.getByText( '2 of 7' ) ).toBeVisible();
		expect( screen.getByText( 'Scan', { selector: 'span' } ) ).toBeVisible();

		STEPS.forEach( ( { label } ) => {
			expect( screen.getByText( label, { selector: 'span' } ) ).toBeVisible();
		} );
	} );

	it( 'fills the segments up to and including the current step', () => {
		const { container } = render(
			<MigrationWizardProgress steps={ STEPS } current="site-migration-preview" />
		);

		const segments = container.querySelectorAll( '.migration-wizard-progress__segment' );

		expect( segments ).toHaveLength( 7 );
		expect(
			container.querySelectorAll( '.migration-wizard-progress__segment.is-filled' )
		).toHaveLength( 4 );
		expect( segments[ 3 ] ).toHaveClass( 'is-current' );
	} );

	it( 'renders nothing when the current step is not in the list', () => {
		const { container } = render(
			<MigrationWizardProgress steps={ STEPS } current="site-migration-unknown" />
		);

		expect( screen.queryByRole( 'progressbar' ) ).not.toBeInTheDocument();
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when there are no steps', () => {
		const { container } = render( <MigrationWizardProgress steps={ [] } current="anything" /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
