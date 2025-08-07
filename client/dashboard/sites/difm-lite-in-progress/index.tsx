import { useSuspenseQuery } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteDifmWebsiteContentQuery } from '../../app/queries/site-do-it-for-me';
import { siteDomainsQuery } from '../../app/queries/site-domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { hasGSuiteWithUs, hasTitanMailWithUs } from '../../utils/domain-features';
import type { Site } from '../../data/types';
import './style.scss';

function SupportLink( { children }: { children?: React.ReactNode } ) {
	const { setShowHelpCenter, setSubject, setNavigateToRoute } = useHelpCenter();

	const emailUrl = `/contact-form?${ new URLSearchParams( {
		mode: 'EMAIL',
		'disable-gpt': 'true',
		'skip-resources': 'true',
	} ).toString() }`;

	return (
		<Button
			variant="link"
			onClick={ () => {
				setNavigateToRoute( emailUrl );
				setSubject( __( 'I have a question about my project' ) );
				setShowHelpCenter( true );
			} }
		>
			{ children }
		</Button>
	);
}

function WebsiteContentSubmitted( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: primaryDomain } = useSuspenseQuery( {
		...siteDomainsQuery( site.ID ),
		select: ( data ) => data.find( ( domain ) => domain.primary_domain ),
	} );
	const hasEmailWithUs =
		primaryDomain && ( hasGSuiteWithUs( primaryDomain ) || hasTitanMailWithUs( primaryDomain ) );

	const recordEmailClick = () => {
		recordTracksEvent(
			hasEmailWithUs
				? 'calypso_dashboard_difm_lite_in_progress_email_manage'
				: 'calypso_dashboard_difm_lite_in_progress_email_cta',
			{
				domain: primaryDomain?.domain,
			}
		);
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Your content submission was successful!' ) }
					description={
						<>
							{ sprintf(
								// translators: %d is the number of business days it will take to build the site. Always greater than 1.
								__(
									'We are currently building your site and will send you an email when it’s ready, within %d business days.'
								),
								{ args: [ 4 ] }
							) }
							<br />
							{ createInterpolateElement(
								__( '<a>Contact support</a> if you have any questions.' ),
								{
									a: <SupportLink />,
								}
							) }
						</>
					}
				/>
			}
			size="small"
		>
			<HStack spacing={ 4 } justify="start">
				<RouterLinkButton variant="primary" to={ `/v2/sites/${ site.slug }/domains` }>
					{ __( 'Manage domain' ) }
				</RouterLinkButton>
				<RouterLinkButton
					variant="secondary"
					onClick={ recordEmailClick }
					to={ `/v2/sites/${ site.slug }/emails` }
				>
					{ hasEmailWithUs ? __( 'Manage email' ) : __( 'Add email' ) }
				</RouterLinkButton>
			</HStack>
		</PageLayout>
	);
}

function WebsiteContentSubmissionPending() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Your content submission was successful!' ) }
					description={ sprintf(
						// translators: %d is the number of business days it will take to build the site. Always greater than 1.
						__(
							'We are currently building your site and will send you an email when it’s ready, within %d business days.'
						),
						{ args: [ 4 ] }
					) }
				/>
			}
			size="small"
		>
			<HStack spacing={ 4 } justify="start">
				<Button variant="primary">{ __( 'Manage domain' ) }</Button>
				<Button variant="secondary">{ __( 'Add email' ) }</Button>
			</HStack>
		</PageLayout>
	);
}

export default function SiteDifmLiteInProgress( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: isSubmitted } = useSuspenseQuery( {
		...siteDifmWebsiteContentQuery( site.ID ),
		select: ( data ) => data.is_website_content_submitted,
	} );

	return isSubmitted ? (
		<WebsiteContentSubmitted site={ site } />
	) : (
		<WebsiteContentSubmissionPending />
	);
}
