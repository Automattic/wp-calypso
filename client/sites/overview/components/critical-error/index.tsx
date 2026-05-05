import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { HelpCenter } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, envelope, formatListBullets, help } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { HostingHero } from 'calypso/components/hosting-hero';
import { Notice } from 'calypso/dashboard/components/notice';
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import { Text } from 'calypso/dashboard/components/text';
import { hasHostingFeature } from 'calypso/dashboard/utils/site-features';
import {
	getJetpackCriticalErrorMessage,
	getJetpackRecoverySessionErrors,
} from 'calypso/dashboard/utils/site-jetpack-critical-error';
import { siteTypeSupportsFeature } from 'calypso/dashboard/utils/site-type-feature-support';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { JetpackRecoverySessionError } from '@automattic/api-core';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

const RecoveryErrorNotice = ( { error }: { error: JetpackRecoverySessionError } ) => {
	const translate = useTranslate();
	return (
		<VStack spacing={ 3 }>
			<SectionHeader
				level={ 3 }
				title={
					error.kind === 'themes' ? translate( 'Suspected theme' ) : translate( 'Suspected plugin' )
				}
			/>
			<Notice variant="error">
				<VStack spacing={ 1 }>
					<Text weight={ 500 }>
						{ error.version ? `${ error.slug } (v${ error.version })` : error.slug }
					</Text>
					<Text>{ error.message }</Text>
					<Text variant="muted">
						{ translate( '%(file)s:%(line)d', {
							args: { file: error.file, line: error.line },
						} ) }
					</Text>
				</VStack>
			</Notice>
		</VStack>
	);
};

const Item = ( { icon, children }: { icon: ReactElement; children: ReactNode } ) => (
	<div className="critical-error-overview__item">
		<div className="critical-error-overview__item-icon">
			<Icon icon={ icon } size={ 20 } />
		</div>
		<div className="critical-error-overview__item-text">{ children }</div>
	</div>
);

export const CriticalErrorOverview = ( { siteSlug }: { siteSlug: string } ) => {
	const translate = useTranslate();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const isAdmin = !! site?.capabilities?.manage_options;

	useEffect( () => {
		if ( ! site ) {
			return;
		}
		recordTracksEvent( 'calypso_critical_error_impression' );
	}, [ site ] );

	if ( ! site ) {
		return null;
	}

	const canAccessPhpLogs =
		isAdmin &&
		siteTypeSupportsFeature( site, 'logs' ) &&
		hasHostingFeature( site, HostingFeatures.LOGS );

	const message = getJetpackCriticalErrorMessage( site );
	const recoveryErrors = isAdmin ? getJetpackRecoverySessionErrors( site ) : [];

	return (
		// Wrapper class is also used by the `:has()` override in style.scss to
		// bypass the inherited max-width on `.dashboard-backport-site-overview`.
		<div className="critical-error-overview">
			<HostingHero>
				<h1>{ translate( 'Your site cannot currently be reached' ) }</h1>
				<p>{ message }</p>
			</HostingHero>
			{ recoveryErrors.length > 0 && (
				<VStack spacing={ 0 } className="critical-error-overview__recovery-errors">
					{ recoveryErrors.map( ( error, index ) => (
						<RecoveryErrorNotice
							key={ `${ error.kind }-${ error.slug }-${ index }` }
							error={ error }
						/>
					) ) }
				</VStack>
			) }
			<VStack spacing={ 3 } className="critical-error-overview__next-steps">
				<SectionHeader level={ 3 } title={ translate( 'What you can try next' ) } />
				<Card>
					<CardBody>
						<div className="critical-error-overview__items">
							{ isAdmin && (
								<Item icon={ envelope }>
									{ createInterpolateElement(
										// translators: <q/> is the search phrase to use in the email inbox.
										translate(
											'Search your admin email inbox for the keyword <q/> for troubleshooting instructions.'
										) as string,
										{ q: <strong>{ translate( 'critical error' ) }</strong> }
									) }
								</Item>
							) }
							{ canAccessPhpLogs && (
								<Item icon={ formatListBullets }>
									{ createInterpolateElement(
										// translators: <phpLogsLink/> is a link to the PHP logs page with the text "Review the PHP logs"
										translate(
											'<phpLogsLink/> to locate any fatal errors on your site.'
										) as string,
										{
											phpLogsLink: (
												<a
													href={ addQueryArgs( `/site-logs/${ siteSlug }/php`, {
														severity: 'Fatal error',
													} ) }
												>
													{ translate( 'Review the PHP logs' ) }
												</a>
											),
										}
									) }
								</Item>
							) }
							<Item icon={ help }>
								{ createInterpolateElement(
									translate(
										'<button>Contact WordPress.com support</button> and we will help you get back online.'
									) as string,
									{
										button: (
											<Button
												variant="link"
												onClick={ () => {
													recordTracksEvent( 'calypso_critical_error_contact_support_click' );
													setShowHelpCenter( true );
												} }
											/>
										),
									}
								) }
							</Item>
						</div>
					</CardBody>
				</Card>
			</VStack>
		</div>
	);
};

export default CriticalErrorOverview;
