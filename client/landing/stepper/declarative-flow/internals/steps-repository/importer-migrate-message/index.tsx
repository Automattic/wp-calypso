import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
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

const ImporterMigrateMessage: Step = () => {
	const locale = useLocale();
	const user = useSelector( getCurrentUser ) as UserData;
	const siteSlugParam = useSiteSlugParam();
	const fromUrl = useQuery().get( 'from' ) || '';
	const siteSlug = siteSlugParam ?? '';
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

	return (
		<StepContainer
			stepName="migration-message"
			hideBack
			formattedHeader={ <FormattedHeader headerText={ __( 'Let us take it from here!' ) } /> }
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
					<div className="feature">
						<span className="icon">
							<Icon icon={ shield } />
						</span>
						{ __( `We'll explain how to securely share your site credentials with us.` ) }
					</div>
					<div className="feature">
						<span className="icon">
							<Icon icon={ backup } />
						</span>
						{ __(
							`We'll update you on the progress of the migration, which usually takes 2-3 business days.`
						) }
					</div>
					<div className="feature">
						<span className="icon">
							<Icon icon={ group } />
						</span>
						{ __( `We’ll create a copy of your live site, allowing you to compare the two.` ) }
					</div>
					<div className="feature">
						<span className="icon">
							<Icon icon={ globe } />
						</span>
						{ __( `We'll help you with the domain changes after the migration is completed.` ) }
					</div>

					<div className="migration-message__actions">
						<FlowCard
							title={ __( 'Let me explore' ) }
							text={ __(
								'Discover more features and options available on WordPress.com on your own.'
							) }
							onClick={ () => redirect( `/home/${ siteSlug }` ) }
						/>
						<FlowCard
							title={ __( 'Help me learn' ) }
							text={ __(
								'Access guides and tutorials to better understand how to use WordPress.com.'
							) }
							onClick={ () => redirect( '/support' ) }
						/>
					</div>
				</>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ImporterMigrateMessage;
