/**
 * @jest-environment jsdom
 */

import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import { useAnalytics } from '../../../analytics';
import { createFreeDomainUpsellNodeBuilder } from '../index';
import type { AdminBarNode } from '@automattic/omnibar';

const freeDomainUpsellNode = {
	id: 'free-domain-upsell',
	title:
		'<span class="ab-icon" aria-hidden="true"><svg></svg></span><span class="ab-label">Free domain</span>',
	parent: false,
	href: 'https://wordpress.com/setup/domain-and-plan?siteSlug=test-site.wordpress.com&ref=omnibar-free-domain',
	group: false,
	meta: {
		title: 'Free domain with an annual plan',
		menu_title: 'Free domain',
		upsell_source: 'free_to_paid_plan',
	},
} as AdminBarNode;

const upsellEventProps = {
	upsell_id: 'omnibar-free-domain',
	upsell_source: 'free_to_paid_plan',
	source: 'dashboard',
};

function FreeDomainUpsellNodeOmnibar() {
	const { recordTracksEvent } = useAnalytics();
	const { siteNodes } = buildOmnibarNodesFromAdminBarNodes( [ freeDomainUpsellNode ], {
		'free-domain-upsell': createFreeDomainUpsellNodeBuilder( {
			sectionName: 'dashboard',
			recordTracksEvent,
		} ),
	} );
	return <Omnibar nodes={ { site: { id: 'site-name', title: 'Test Site' }, siteNodes } } />;
}

describe( '<Omnibar> free domain upsell node', () => {
	test( 'shows the node', async () => {
		const { recordTracksEvent } = render( <FreeDomainUpsellNodeOmnibar /> );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const node = await within( toolbar ).findByRole( 'button', { name: 'Free domain' } );
		expect( within( node ).getByText( 'Free domain' ) ).toBeVisible();
		expect( node ).toHaveAttribute( 'href', freeDomainUpsellNode.href );
		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_omnibar_upsell_impression',
				upsellEventProps
			)
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_omnibar_upsell_click',
			expect.anything()
		);
	} );

	test( 'records a click when clicking the node', async () => {
		const user = userEvent.setup();
		const { recordTracksEvent } = render( <FreeDomainUpsellNodeOmnibar /> );

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await user.click( await within( toolbar ).findByRole( 'button', { name: 'Free domain' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_omnibar_upsell_click',
			upsellEventProps
		);
	} );
} );
