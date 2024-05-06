import { useLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { sprintf, __ } from '@wordpress/i18n';
import { Icon, globe, group, shield, backup } from '@wordpress/icons';
import { useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { UserData } from 'calypso/lib/user/user';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useSubmitMigrationTicket } from './hooks/use-submit-migration-ticket';

const ImporterMigrateMessage: Step = () => {
	const locale = useLocale();
	const user = useSelector( getCurrentUser ) as UserData;
	const siteSlugParam = useSiteSlugParam();
	const siteSlug = siteSlugParam ?? '';
	const { isPending, sendTicket } = useSubmitMigrationTicket();

	useEffect( () => {
		recordTracksEvent( 'wpcom_support_free_migration_request_click', {
			path: window.location.pathname,
		} );
		sendTicket( {
			locale,
			blog_url: siteSlug,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<StepContainer
			stepName="migration-message"
			hideBack={ true }
			formattedHeader={ <FormattedHeader headerText={ __( 'Let us take it from here!' ) } /> }
			isHorizontalLayout={ false }
			stepContent={
				<>
					{ isPending && <LoadingEllipsis /> }
					{ ! isPending && (
						<div className="message">
							{ sprintf(
								// translators: %(email)s is the customer's email and %(webSite)s his site.
								__(
									'You are all set! Our Happiness Engineers will be reaching out to you shortly at %(email)s to help you migrate %(webSite)s to WordPress.com.'
								),
								{
									email: user?.email,
									webSite: siteSlug,
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
				</>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ImporterMigrateMessage;
