/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithProvider, testDomain } from '../../test-utils';
import { DomainsTableSiteCell } from '../domains-table-site-cell';

test( 'when a site is associated with a domain, display its name', async () => {
	const [ , primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
	} );

	const site = { ID: 123, name: 'Primary Domain Blog' };

	renderWithProvider(
		<DomainsTableSiteCell
			site={ site }
			currentDomainData={ primaryFull }
			siteSlug="primary-domain.blog"
		/>
	);

	await waitFor( () => expect( screen.queryByText( 'Primary Domain Blog' ) ).toBeInTheDocument() );
} );

test( 'when a site is not associated with a domain, display site linking ctas', async () => {
	const [ , primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		current_user_can_create_site_from_domain_only: true,
	} );

	const site = { ID: 123, name: 'primarydomainblog.wordpress.com' };

	renderWithProvider(
		<DomainsTableSiteCell
			site={ site }
			currentDomainData={ primaryFull }
			siteSlug="primary-domain.blog"
		/>
	);

	await waitFor( () => {
		const createLink = screen.queryByText( 'Create' );
		const connectLink = screen.queryByText( 'connect' );

		expect( createLink ).toBeInTheDocument();
		expect( createLink ).toHaveAttribute(
			'href',
			'/start/site-selected/?siteSlug=primary-domain.blog&siteId=123'
		);

		expect( connectLink ).toBeInTheDocument();
		expect( connectLink ).toHaveAttribute(
			'href',
			'/domains/manage/all/primary-domain.blog/transfer/other-site/primary-domain.blog'
		);
	} );
} );
