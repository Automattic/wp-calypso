import config from '@automattic/calypso-config';
import { useLocale, useHasEnTranslation } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { Icon, globe, group, shield, backup } from '@wordpress/icons';
import { createElement, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { UserData } from 'calypso/lib/user/user';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import FlowCard from '../components/flow-card';
import { redirect } from '../import/util';
import { useSubmitMigrationTicket } from './hooks/use-submit-migration-ticket';

interface ActionsProps {
	title: string;
	text: string;
	onClick: () => void;
}

interface WhatToExpectProps {
	icon: JSX.Element;
	text: string;
}

const ImporterMigrateMessage: Step = () => {
	const locale = useLocale();
	const hasEnTranslation = useHasEnTranslation();
	const user = useSelector( getCurrentUser ) as UserData;
	const siteSlugParam = useSiteSlugParam();
	const fromUrl = useQuery().get( 'from' ) || '';
	const siteSlug = siteSlugParam ?? '';
	const isCredentialsSkipped = useQuery().get( 'credentials' ) === 'skipped';
	const { isPending, sendTicket } = useSubmitMigrationTicket();

	useEffect( () => {
		recordTracksEvent( 'wpcom_support_free_migration_request_click', {
			path: window.location.pathname,
		} );
		sendTicket( {
			locale,
			from_url: fromUrl,
			blog_url: siteSlug,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
	let whatToExpect: WhatToExpectProps[] = [];
	let actions: ActionsProps[] = [];

	if ( ! isCredentialsSkipped && config.isEnabled( 'automated-migration/collect-credentials' ) ) {
		whatToExpect = [
			{
				icon: group,
				text: __(
					`We'll bring over a copy of your site, without affecting the current live version.`
				),
			},
			{
				icon: backup,
				text: __(
					`You'll get an update on the progress of your migration within 2-3 business days.`
				),
			},
		];
		actions = [
			{
				title: __( 'Explore features' ),
				text: __( 'Discover the features available on WordPress.com' ),
				onClick: () => redirect( `/home/${ siteSlug }` ),
			},
			{
				title: __( 'Learn about WordPress.com' ),
				text: __( 'Access guides and tutorials to better understand how to use WordPress.com.' ),
				onClick: () => redirect( '/support' ),
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
					`We'll update you on the progress of the migration, which usually takes 2-3 business days.`
				),
			},
			{
				icon: group,
				text: __( `We'll create a copy of your live site, allowing you to compare the two.` ),
			},
		];
		actions = [
			{
				title: __( 'Let me explore' ),
				text: __( 'Discover more features and options available on WordPress.com on your own.' ),
				onClick: () => redirect( `/home/${ siteSlug }` ),
			},
			{
				title: __( 'Help me learn' ),
				text: __( 'Access guides and tutorials to better understand how to use WordPress.com.' ),
				onClick: () => redirect( '/support' ),
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
					<div className="migration-message__actions">
						{ actions.map( ( { title, text, onClick }, index ) => (
							<FlowCard key={ index } title={ title } text={ text } onClick={ onClick } />
						) ) }
					</div>
				</>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ImporterMigrateMessage;
