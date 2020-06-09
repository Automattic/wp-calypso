/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import NavigationLink from 'components/wizard/navigation-link';
import { addQueryArgs } from 'lib/url';
import { localizeUrl } from 'lib/i18n-utils';

export default function DownFlow( { translate, confirmHref, backHref, site } ) {
	return (
		<Main className="disconnect-site__down-flow">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<FormattedHeader
				headerText={ translate( 'Your site {{strong}}%(siteName)s{{/strong}} cannot be accessed', {
					args: { siteName: site.name },
					components: { strong: <strong /> },
				} ) }
				subHeaderText={ translate(
					'Jetpack is unable to connect to your site at {{strong}}%(siteSlug)s{{/strong}}.{{br/}}There might be a few reasons for that — how do you want to proceed?',
					{
						args: { siteSlug: site.slug },
						components: {
							strong: <strong />,
							br: <br />,
						},
					}
				) }
			/>
			<div className="disconnect-site__actions">
				<CompactCard href={ site.URL } target="_blank" rel="noopener noreferrer">
					<Gridicon
						className="disconnect-site__action-icon disconnect-site__confirm-icon"
						icon="globe"
					/>
					<FormattedHeader
						isSecondary
						align="left"
						headerText={ translate( 'Confirm your site is loading' ) }
						subHeaderText={ translate(
							'As a first step, we suggest trying to open your site to ensure it’s loading correctly.'
						) }
					/>
				</CompactCard>
				<CompactCard
					href={ localizeUrl(
						'https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/'
					) }
				>
					<Gridicon
						className="disconnect-site__action-icon disconnect-site__troubleshoot-icon"
						icon="plans"
					/>
					<FormattedHeader
						isSecondary
						align="left"
						headerText={ translate( 'Troubleshoot Jetpack' ) }
						subHeaderText={ translate(
							'Select this option if you’re still using Jetpack but seeing this error.'
						) }
					/>
				</CompactCard>
				<CompactCard href={ addQueryArgs( { type: 'down' }, confirmHref ) }>
					<Gridicon
						className="disconnect-site__action-icon disconnect-site__disconnect-icon"
						icon="cross-circle"
					/>
					<FormattedHeader
						isSecondary
						align="left"
						headerText={ translate( 'Disconnect Jetpack' ) }
						subHeaderText={ translate(
							'Select this option if your site isn’t available anymore or if you’ve stopped using Jetpack and/or WordPress.'
						) }
					/>
				</CompactCard>
			</div>
			<p>
				{ translate(
					'You might also be seeing this error because you don’t have enough permissions on this site.{{br/}}Please contact your site administrator for more details.',
					{ components: { br: <br /> } }
				) }
			</p>
			<div className="disconnect-site__navigation-links">
				<NavigationLink href={ backHref } direction="back" />
			</div>
		</Main>
	);
}
