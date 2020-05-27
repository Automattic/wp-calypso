/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import DisconnectSurvey from './disconnect-survey';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import NavigationLink from 'components/wizard/navigation-link';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';
import Troubleshoot from './troubleshoot';
import { getSelectedSiteSlug, getSelectedSite } from 'state/ui/selectors';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

const DisconnectSite = ( {
	reason,
	type,
	siteSlug,
	site: { name: siteName, URL: siteUrl },
	translate,
} ) => {
	const confirmHref = '/settings/disconnect-site/confirm/' + siteSlug;

	let backHref = '/settings/manage-connection/' + siteSlug;
	if ( reason ) {
		backHref = '/settings/disconnect-site/' + siteSlug;
	}

	if ( type === 'down' ) {
		return (
			<div>
				<Main className="disconnect-site__down-flow">
					<DocumentHead title={ translate( 'Site Settings' ) } />
					<FormattedHeader
						headerText={ translate(
							'Your site {{strong}}%(siteName)s{{/strong}} cannot be accessed',
							{
								args: { siteName },
								components: { strong: <strong /> },
							}
						) }
						subHeaderText={ translate(
							'Jetpack wasn’t able to connect to your site at {{strong}}%(siteSlug)s{{/strong}}.{{br/}}There might be a few reasons for that, how do you want to proceed?',
							{
								args: { siteSlug },
								components: {
									strong: <strong />,
									br: <br />,
								},
							}
						) }
					/>
					<div className="disconnect-site__actions">
						<CompactCard href={ siteUrl } target="_blank" rel="noopener noreferrer">
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
							<FormattedHeader
								isSecondary
								align="left"
								headerText={ translate( 'Troubleshoot Jetpack' ) }
								subHeaderText={ translate(
									'Select this option if you’re still using Jetpack but seeing this error.'
								) }
							/>
						</CompactCard>
						<CompactCard href={ confirmHref }>
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
			</div>
		);
	}

	return (
		<div>
			<Main className="disconnect-site__site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<FormattedHeader
					headerText={ translate( 'Disable Jetpack' ) }
					subHeaderText={ translate( "Please let us know why you're disabling Jetpack." ) }
				/>
				<DisconnectSurvey confirmHref={ confirmHref } />
				<div className="disconnect-site__navigation-links">
					<NavigationLink href={ backHref } direction="back" />
					<NavigationLink href={ confirmHref } direction="forward" />
				</div>
				<Troubleshoot />
			</Main>
		</div>
	);
};

const connectComponent = connect( ( state ) => ( {
	siteSlug: getSelectedSiteSlug( state ),
	site: getSelectedSite( state ),
} ) );

export default flowRight( connectComponent, localize, redirectNonJetpack() )( DisconnectSite );
