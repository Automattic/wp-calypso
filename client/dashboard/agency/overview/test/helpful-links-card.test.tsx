/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import HelpfulLinksCard from '../helpful-links-card';

describe( '<HelpfulLinksCard>', () => {
	test( 'shows a badge beside a link that has one', () => {
		render(
			<HelpfulLinksCard
				links={ [
					{ id: 'opt-in', label: 'Enable the new dashboard', href: '/opt-in', badge: 'Beta' },
					{ id: 'docs', label: 'Knowledge base', href: 'https://example.com', isExternal: true },
				] }
			/>
		);

		expect( screen.getByRole( 'link', { name: 'Enable the new dashboard Beta' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Knowledge base/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /Knowledge base.*Beta/ } ) ).toBeNull();
	} );
} );
