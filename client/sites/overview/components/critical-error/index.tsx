import { siteBySlugQuery } from '@automattic/api-queries';
import { HelpCenter } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, CardBody } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, envelope, help } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { HostingHero } from 'calypso/components/hosting-hero';
import { getJetpackCriticalErrorMessage } from 'calypso/dashboard/sites/site/notices';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

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

	const message = getJetpackCriticalErrorMessage( site );

	return (
		// Wrapper class is also used by the `:has()` override in style.scss to
		// bypass the inherited max-width on `.dashboard-backport-site-overview`.
		<div className="critical-error-overview">
			<HostingHero>
				<h1>{ translate( 'Your site cannot currently be reached' ) }</h1>
				<p>{ message }</p>
			</HostingHero>
			<Card className="critical-error-overview__card">
				<CardBody>
					<div className="critical-error-overview__items">
						{ isAdmin && (
							<Item icon={ envelope }>
								{ translate(
									'Check your site admin email inbox for instructions to troubleshoot.'
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
		</div>
	);
};

export default CriticalErrorOverview;
