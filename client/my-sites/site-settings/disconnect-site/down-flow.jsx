import { CompactCard, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import NavigationLink from 'calypso/components/wizard/navigation-link';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

function DownFlow( { confirmHref, backHref, site, recordTracksEvent: tracks } ) {
	const translate = useTranslate();

	return (
		<Main className="disconnect-site__down-flow">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Your site, {{strong}}%(siteName)s{{/strong}}, cannot be accessed', {
					args: { siteName: site.name },
					components: { strong: <strong /> },
				} ) }
				subtitle={ translate(
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
				<CompactCard
					onClick={ () => tracks( 'calypso_jetpack_site_indicator_disconnect_confirm' ) }
					href={ site.URL }
					target="_blank"
					rel="noopener noreferrer"
				>
					<Gridicon
						className="disconnect-site__action-icon disconnect-site__confirm-icon"
						icon="globe"
					/>
					<FormattedHeader
						isSecondary
						align="left"
						headerText={ translate( 'Confirm that your site loads' ) }
						subHeaderText={ translate(
							'Visit your site to make sure it loads properly. If there’s an issue, fix your site before worrying about Jetpack! That may resolve this error.'
						) }
					/>
				</CompactCard>
				<CompactCard
					onClick={ () => tracks( 'calypso_jetpack_site_indicator_disconnect_troubleshoot' ) }
					href={ localizeUrl(
						'https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/'
					) }
					target="_blank"
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
							'If your site is loading but you’re still seeing this error, this guide will help you troubleshoot the Jetpack connection.'
						) }
					/>
				</CompactCard>
				<CompactCard
					onClick={ () => tracks( 'calypso_jetpack_site_indicator_disconnect_disconnect' ) }
					href={ addQueryArgs( { type: 'down' }, confirmHref ) }
				>
					<Gridicon
						className="disconnect-site__action-icon disconnect-site__disconnect-icon"
						icon="cross-circle"
					/>
					<FormattedHeader
						isSecondary
						align="left"
						headerText={ translate( 'Disconnect Jetpack' ) }
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

export default connect( null, {
	recordTracksEvent,
} )( DownFlow );
