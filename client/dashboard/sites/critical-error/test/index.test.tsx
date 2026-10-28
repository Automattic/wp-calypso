/**
 * @jest-environment jsdom
 */

import { DotcomFeatures, HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import SiteCriticalError from '../index';
import type { Site } from '@automattic/api-core';

const siteSlug = 'broken.wpcomstaging.com';

function createSite( overrides: Partial< Site > = {} ) {
	return {
		ID: 1,
		slug: siteSlug,
		jetpack: true,
		is_wpcom_atomic: true,
		capabilities: { manage_options: true },
		plan: {
			features: {
				active: [ DotcomFeatures.ATOMIC, HostingFeatures.SFTP ],
			},
		},
		options: {
			jetpack_recovery_mode_status: {
				recovery_mode_email_last_sent: Math.floor( Date.now() / 1000 ),
			},
		},
		__inaccessible_jetpack_error: new Error( 'The site is unreachable.' ),
		...overrides,
	} as Site;
}

function renderCriticalError( site: Site ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( siteBySlugQuery( siteSlug ).queryKey, site );

	return render( <SiteCriticalError siteSlug={ siteSlug } />, { queryClient } );
}

describe( '<SiteCriticalError>', () => {
	test( 'links to the SFTP/SSH settings when the plan includes SFTP', async () => {
		const user = userEvent.setup();
		const { recordTracksEvent } = renderCriticalError( createSite() );

		const link = await screen.findByRole( 'link', { name: 'Connect over SFTP/SSH' } );
		expect( link ).toHaveAttribute( 'href', `/sites/${ siteSlug }/settings/sftp-ssh` );

		await user.click( link );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_critical_error_sftp_click',
			{ has_sftp_feature: true }
		);
	} );

	test( 'links to the SFTP/SSH settings when the plan does not include SFTP', async () => {
		const user = userEvent.setup();
		const { recordTracksEvent } = renderCriticalError(
			createSite( {
				plan: { features: { active: [ DotcomFeatures.ATOMIC ] } },
			} as Partial< Site > )
		);

		const link = await screen.findByRole( 'link', { name: 'Connect over SFTP/SSH' } );
		expect( link ).toHaveAttribute( 'href', `/sites/${ siteSlug }/settings/sftp-ssh` );

		await user.click( link );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_critical_error_sftp_click',
			{ has_sftp_feature: false }
		);
	} );

	test( 'does not link to the SFTP/SSH settings for users who cannot manage the site', async () => {
		renderCriticalError(
			createSite( { capabilities: { manage_options: false } } as Partial< Site > )
		);

		expect( await screen.findByText( 'What you can try next' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: 'Connect over SFTP/SSH' } )
		).not.toBeInTheDocument();
	} );
} );
