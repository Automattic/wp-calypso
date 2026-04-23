import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, envelope, help, wordpress } from '@wordpress/icons';
import { Fragment, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { Card, CardBody, CardDivider } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getJetpackCriticalErrorMessage, getJetpackCriticalErrorState } from '../site/notices';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

type Item = {
	icon: ReactElement;
	text: ReactNode;
};

const SiteCriticalError = ( { siteSlug }: { siteSlug: string } ) => {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { setShowHelpCenter } = useHelpCenter();
	const { recordTracksEvent } = useAnalytics();

	const isAdmin = !! site.capabilities?.manage_options;
	const isInRecovery = getJetpackCriticalErrorState( site ) === 'in-recovery';
	const adminUrl = site.options?.admin_url;
	const showWpAdmin = isAdmin && isInRecovery && !! adminUrl;

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_critical_error_impression' );
		if ( showWpAdmin ) {
			recordTracksEvent( 'calypso_dashboard_critical_error_wp_admin_impression' );
		}
	}, [ showWpAdmin, recordTracksEvent ] );

	const message = getJetpackCriticalErrorMessage( site );

	const items: Item[] = [];
	if ( showWpAdmin ) {
		items.push( {
			icon: wordpress,
			text: createInterpolateElement(
				__( '<a>Visit WP Admin</a> to resume the recovery mode session.' ),
				{
					a: (
						<a
							href={ adminUrl }
							onClick={ () =>
								recordTracksEvent( 'calypso_dashboard_critical_error_wp_admin_click' )
							}
						/>
					),
				}
			),
		} );
	}
	if ( isAdmin ) {
		items.push( {
			icon: envelope,
			text: __( 'Check your site admin email inbox for instructions to troubleshoot.' ),
		} );
	}
	items.push( {
		icon: help,
		text: createInterpolateElement(
			__( '<button>Contact WordPress.com support</button> and we will help you get back online.' ),
			{
				button: (
					<Button
						variant="link"
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_critical_error_contact_support_click' );
							setShowHelpCenter( true );
						} }
					/>
				),
			}
		),
	} );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Your site cannot currently be reached' ) }
					description={ message }
				/>
			}
			size="small"
		>
			<Card className="site-critical-error__card">
				{ items.map( ( item, index ) => (
					<Fragment key={ index }>
						<CardBody>
							<div className="site-critical-error__item">
								<div className="site-critical-error__item-icon">
									<Icon icon={ item.icon } size={ 20 } />
								</div>
								<div className="site-critical-error__item-text">{ item.text }</div>
							</div>
						</CardBody>
						{ index < items.length - 1 && <CardDivider /> }
					</Fragment>
				) ) }
			</Card>
		</PageLayout>
	);
};

export default SiteCriticalError;
