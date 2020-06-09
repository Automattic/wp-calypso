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
import { useTranslate } from 'i18n-calypso';

export default function DownFlow( { confirmHref, backHref, site } ) {
	const translate = useTranslate();

	return (
		<Main className="disconnect-site__down-flow">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<FormattedHeader
				headerText={ translate(
					'Your site, {{strong}}%(siteName)s{{/strong}}, cannot be accessed',
					{
						args: { siteName: site.name },
						components: { strong: <strong /> },
					}
				) }
				subHeaderText={ translate(
					'Jetpack wasn’t able to connect to {{strong}}%(siteSlug)s{{/strong}}.{{br/}}Let’s figure out why — there are a few things to try.',
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
						headerText={ translate( 'Confirm that your site loads.' ) }
						subHeaderText={ translate(
							'Visit your site to make sure it loads properly. If there’s an issue, fix your site before worrying about Jetpack! That may resolve this error.'
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
						headerText={ translate( 'Troubleshoot Jetpack.' ) }
						subHeaderText={ translate(
							'If your site is working but you’re still seeing this error, let’s troubleshoot your Jetpack connection.'
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
						headerText={ translate( 'Disconnect Jetpack.' ) }
						subHeaderText={ translate(
							'If you’re no longer using Jetpack and/or WordPress for your site, or you’ve taken your site down, it’s time to disconnect Jetpack.'
						) }
					/>
				</CompactCard>
			</div>
			<p>
				{ translate(
					'Note: You may be seeing this error because you don’t have admin permissions for this site.{{br/}}If you think you should, contact your site administrator.',
					{ components: { br: <br /> } }
				) }
			</p>
			<div className="disconnect-site__navigation-links">
				<NavigationLink href={ backHref } direction="back" />
			</div>
		</Main>
	);
}
