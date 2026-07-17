import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import {
	Button,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, envelope, formatListBullets, help, wordpress } from '@wordpress/icons';
import { Fragment, useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { Card, CardBody, CardDivider } from '../../components/card';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { hasHostingFeature } from '../../utils/site-features';
import {
	getJetpackCriticalErrorMessage,
	getJetpackRecoverySessionErrors,
	isInJetpackCriticalErrorState,
} from '../../utils/site-jetpack-critical-error';
import { siteTypeSupportsFeature } from '../../utils/site-type-feature-support';
import type { JetpackRecoverySessionError } from '@automattic/api-core';
import type { ReactElement, ReactNode } from 'react';

type Item = {
	icon: ReactElement;
	text: ReactNode;
};

// Poll while the user is on the critical-error screen so we can send them back
// to the overview as soon as the site comes back online.
const RECOVERY_POLL_INTERVAL_MS = 30_000;

const RecoveryErrorNotice = ( { error }: { error: JetpackRecoverySessionError } ) => (
	<VStack spacing={ 3 }>
		<SectionHeader
			level={ 3 }
			title={ error.kind === 'themes' ? __( 'Suspected theme' ) : __( 'Suspected plugin' ) }
		/>
		<Notice variant="error">
			<VStack spacing={ 1 }>
				<Text weight={ 500 }>
					{ error.version ? `${ error.slug } (v${ error.version })` : error.slug }
				</Text>
				<Text>{ error.message }</Text>
				<Text variant="muted">
					{ sprintf(
						/* translators: 1: file path, 2: line number */
						__( '%1$s:%2$d' ),
						error.file,
						error.line
					) }
				</Text>
			</VStack>
		</Notice>
	</VStack>
);

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
	const recoveryErrors = isAdmin ? getJetpackRecoverySessionErrors( site ) : [];

	const items: Item[] = [];
	if ( isAdmin ) {
		items.push( {
			icon: envelope,
			text: createInterpolateElement(
				// translators: <q/> is the search phrase to use in the email inbox.
				__(
					'Search your admin email inbox for the keyword <q/> for troubleshooting instructions.'
				),
				{ q: <strong>{ __( 'critical error' ) }</strong> }
			),
		} );
	}
	if ( isAdmin && site.options?.admin_url ) {
		items.push( {
			icon: wordpress,
			text: createInterpolateElement(
				// translators: <a/> is a link to the site's wp-admin with the text "Visit your site"
				__( '<a>Visit your site</a> to check available recovery options.' ),
				{
					a: <ExternalLink href={ site.options.admin_url } children={ null } />,
				}
			),
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
						<Link to={ `/sites/${ siteSlug }/logs/php` } search={ { severity: 'Fatal error' } }>
							{ __( 'Review the PHP logs' ) }
						</Link>
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
			<VStack spacing={ 4 }>
				{ recoveryErrors.map( ( error, index ) => (
					<RecoveryErrorNotice
						key={ `${ error.kind }-${ error.slug }-${ index }` }
						error={ error }
					/>
				) ) }
				<VStack spacing={ 3 }>
					<SectionHeader level={ 3 } title={ __( 'What you can try next' ) } />
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
				</VStack>
			</VStack>
		</PageLayout>
	);
};

export default SiteCriticalError;
