import config from '@automattic/calypso-config';
import { useLocale, useHasEnTranslation } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { Icon, globe, group, shield, backup, scheduled } from '@wordpress/icons';
import { createElement, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { MigrationStatus } from 'calypso/data/site-migration/landing/types';
import { useUpdateMigrationStatus } from 'calypso/data/site-migration/landing/use-update-migration-status';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { UserData } from 'calypso/lib/user/user';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useSubmitMigrationTicket } from './hooks/use-submit-migration-ticket';
import './style.scss';

interface WhatToExpectProps {
	icon: JSX.Element;
	text: string;
}

const ImporterMigrateMessage: Step = ( { navigation } ) => {
	const locale = useLocale();
	const hasEnTranslation = useHasEnTranslation();
	const user = useSelector( getCurrentUser ) as UserData;
	const siteSlugParam = useSiteSlugParam();
	const fromUrl = useQuery().get( 'from' ) || '';
	const siteSlug = siteSlugParam ?? '';
	const shouldPreventTicketCreation = useQuery().get( 'preventTicketCreation' ) === 'true';
	const { isPending, sendTicket } = useSubmitMigrationTicket( {
		onSuccess: () => {
			recordTracksEvent( 'calypso_importer_migration_ticket_submit_success', {
				blog_url: siteSlug,
				from_url: fromUrl,
			} );
		},
		onError: ( error ) => {
			recordTracksEvent( 'calypso_importer_migration_ticket_submit_error', {
				blog_url: siteSlug,
				from_url: fromUrl,
				error: error.message,
			} );
			navigation.submit?.( {
				hasError: 'ticket-creation',
			} );
		},
	} );

	const site = useSite();
	const siteId = site?.ID;
	const { mutate: updateMigrationStatus } = useUpdateMigrationStatus( siteId );

	useEffect( () => {
		if ( siteId ) {
			updateMigrationStatus( { status: MigrationStatus.STARTED_DIFM } );
		}
	}, [ siteId, updateMigrationStatus ] );

	useEffect( () => {
		recordTracksEvent( 'wpcom_support_free_migration_request_click', {
			path: window.location.pathname,
			automated_migration: config.isEnabled( 'automated-migration/collect-credentials' ),
			prevent_ticket_creation: shouldPreventTicketCreation,
		} );
		if ( ! shouldPreventTicketCreation ) {
			sendTicket( {
				locale,
				from_url: fromUrl,
				blog_url: siteSlug,
			} );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ shouldPreventTicketCreation, config, fromUrl, siteSlug ] );
	let whatToExpect: WhatToExpectProps[] = [];

	if (
		shouldPreventTicketCreation &&
		config.isEnabled( 'automated-migration/collect-credentials' )
	) {
		whatToExpect = [
			{
				icon: group,
				text: __(
					`We'll bring over a copy of your site, without affecting the current live version.`
				),
			},
			{
				icon: scheduled,
				text: __(
					`We'll send you an update within 2–3 business days. You can also check the progress of your migration from your Sites dashboard.`
				),
			},
		];
	} else {
		whatToExpect = [
			{
				icon: shield,
				text: __( `We'll explain how to securely share your site credentials with us.` ),
			},
			{
				icon: backup,
				text: __(
					`We'll update you on the progress of the migration, which usually takes 2–3 business days.`
				),
			},
			{
				icon: group,
				text: __( `We'll create a copy of your live site, allowing you to compare the two.` ),
			},
		];
	}

	whatToExpect.push( {
		icon: globe,
		text: __( `We'll help you switch your domain over after the migration is complete.` ),
	} );

	const title = hasEnTranslation( "We'll take it from here!" )
		? __( "We'll take it from here!" )
		: __( 'Let us take it from here!' );

	const sitesDashboardButton = (
		<div className="migration-message__cta-wrapper">
			<Button
				className="migration-message__cta"
				href="/sites"
				variant="primary"
				onClick={ () =>
					recordTracksEvent( 'calypso_migration_message_view_sites_dashboard_click' )
				}
			>
				{ __( 'View Sites dashboard' ) }
			</Button>
		</div>
	);

	return (
		<StepContainer
			stepName="migration-message"
			hideBack
			formattedHeader={ <FormattedHeader headerText={ title } /> }
			isHorizontalLayout={ false }
			stepContent={
				<>
					{ isPending && <LoadingEllipsis /> }
					{ ! isPending && (
						<div className="message">
							{ createInterpolateElement(
								sprintf(
									// translators: %(email)s is the customer's email and %(webSite)s his site.
									__(
										'You are all set! Our Happiness Engineers will be reaching out to you shortly at <strong>%(email)s</strong> to help you migrate <strong>%(webSite)s</strong> to WordPress.com.'
									),
									{
										email: user?.email,
										webSite: fromUrl,
									}
								),
								{
									strong: createElement( 'strong' ),
								}
							) }
						</div>
					) }
					<h3>{ __( 'What to expect' ) }</h3>
					{ whatToExpect.map( ( { icon, text }, index ) => (
						<div key={ index } className="feature">
							<span className="icon">
								<Icon icon={ icon } />
							</span>
							{ text }
						</div>
					) ) }
					{ sitesDashboardButton }
				</>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ImporterMigrateMessage;
