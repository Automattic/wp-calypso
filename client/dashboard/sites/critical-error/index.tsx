import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, envelope, formatListBullets, help } from '@wordpress/icons';
import { Fragment, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { Card, CardBody, CardDivider } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { hasHostingFeature } from '../../utils/site-features';
import {
	getJetpackCriticalErrorMessage,
	isInJetpackCriticalErrorState,
} from '../../utils/site-jetpack-critical-error';
import { siteTypeSupportsFeature } from '../../utils/site-type-feature-support';
import type { ReactElement, ReactNode } from 'react';

type Item = {
	icon: ReactElement;
	text: ReactNode;
};

// Poll while the user is on the critical-error screen so we can send them back
// to the overview as soon as the site comes back online.
const RECOVERY_POLL_INTERVAL_MS = 30_000;

const SiteCriticalError = ( { siteSlug }: { siteSlug: string } ) => {
	const { data: site } = useSuspenseQuery( {
		...siteBySlugQuery( siteSlug ),
		refetchInterval: RECOVERY_POLL_INTERVAL_MS,
	} );
	const { setShowHelpCenter } = useHelpCenter();
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();

	const isAdmin = !! site.capabilities?.manage_options;
	const canAccessPhpLogs =
		isAdmin &&
		siteTypeSupportsFeature( site, 'logs' ) &&
		hasHostingFeature( site, HostingFeatures.LOGS );
	const hasRecovered = ! isInJetpackCriticalErrorState( site );

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_critical_error_impression' );
	}, [ recordTracksEvent ] );

	useEffect( () => {
		if ( hasRecovered ) {
			navigate( {
				to: '/sites/$siteSlug',
				params: { siteSlug },
				replace: true,
				viewTransition: false,
			} );
		}
	}, [ hasRecovered, navigate, siteSlug ] );

	const message = getJetpackCriticalErrorMessage( site );

	const items: Item[] = [];
	if ( isAdmin ) {
		items.push( {
			icon: envelope,
			text: __( 'Check your site admin email inbox for instructions to troubleshoot.' ),
		} );
	}
	if ( canAccessPhpLogs ) {
		items.push( {
			icon: formatListBullets,
			text: createInterpolateElement(
				// translators: <phpLogsLink/> is a link to the PHP logs page with the text "Review the PHP logs"
				__( '<phpLogsLink/> to locate any fatal errors on your site.' ),
				{
					phpLogsLink: (
						<Link to={ `/sites/${ siteSlug }/logs/php` }>{ __( 'Review the PHP logs' ) }</Link>
					),
				}
			),
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
			<Card>
				{ items.map( ( item, index ) => (
					<Fragment key={ index }>
						<CardBody>
							<HStack spacing={ 3 } alignment="center" justify="flex-start">
								<Icon icon={ item.icon } size={ 20 } />
								<Text>{ item.text }</Text>
							</HStack>
						</CardBody>
						{ index < items.length - 1 && <CardDivider /> }
					</Fragment>
				) ) }
			</Card>
		</PageLayout>
	);
};

export default SiteCriticalError;
