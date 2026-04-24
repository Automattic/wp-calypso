import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, envelope, help } from '@wordpress/icons';
import { Fragment, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { Card, CardBody, CardDivider } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { getJetpackCriticalErrorMessage } from '../site/notices';
import type { ReactElement, ReactNode } from 'react';

type Item = {
	icon: ReactElement;
	text: ReactNode;
};

const SiteCriticalError = ( { siteSlug }: { siteSlug: string } ) => {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { setShowHelpCenter } = useHelpCenter();
	const { recordTracksEvent } = useAnalytics();

	const isAdmin = !! site.capabilities?.manage_options;

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_critical_error_impression' );
	}, [ recordTracksEvent ] );

	const message = getJetpackCriticalErrorMessage( site );

	const items: Item[] = [];
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
