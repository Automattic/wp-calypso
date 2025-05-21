/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import Section from '../index';

describe( 'Section', () => {
	it( 'applies additional className when provided', () => {
		const customClassName = 'custom-section-class';
		const { container } = render(
			<Section header="Test Header" className={ customClassName }>
				Test Content
			</Section>
		);

		const sectionContainer = container.firstChild;
		expect( sectionContainer ).toHaveClass( customClassName );
	} );
} );
