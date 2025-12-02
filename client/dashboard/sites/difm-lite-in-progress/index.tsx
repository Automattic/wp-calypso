import { WPCOM_DIFM_LITE } from '@automattic/api-core';
import {
	siteDifmWebsiteContentQuery,
	siteDomainsQuery,
	siteBySlugQuery,
	sitePurchasesQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { addDays, isPast } from 'date-fns';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { formatDate } from '../../utils/datetime';
import { hasGSuiteWithUs, hasTitanMailWithUs } from '../../utils/domain';
import type { Site } from '@automattic/api-core';

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
					description={ sprintf(
						// translators: %d is the number of business days it will take to build the site. Always greater than 1.
						__(
							'We are currently building your site and will send you an email when it’s ready, within %d business days.'
						),
						4
					) }
				/>
			}
			size="small"
		>
			<HStack spacing={ 4 } justify="start">
				<RouterLinkButton variant="primary" to={ `/sites/${ site.slug }/domains` }>
					{ __( 'Manage domain' ) }
				</RouterLinkButton>
				<RouterLinkButton
					variant="secondary"
					onClick={ recordEmailClick }
					to={ `/sites/${ site.slug }/emails` }
				>
					{ hasEmailWithUs ? __( 'Manage email' ) : __( 'Add email' ) }
				</RouterLinkButton>
			</HStack>
		</PageLayout>
	);
}

function WebsiteContentSubmissionPending( { site }: { site: Site } ) {
	const locale = useLocale();
	const { data: difmPurchase } = useSuspenseQuery( {
		...sitePurchasesQuery( site.ID ),
		select: ( data ) => data.find( ( purchase ) => purchase.product_slug === WPCOM_DIFM_LITE ),
	} );

	let contentSubmissionDueDate: Date | null = null;
	if ( difmPurchase?.subscribed_date ) {
		const subscribedDate = new Date( difmPurchase.subscribed_date );
		contentSubmissionDueDate = addDays( subscribedDate, difmPurchase.refund_period_in_days );
		if ( isPast( contentSubmissionDueDate ) ) {
			// Due dates in the past are invalid.
			contentSubmissionDueDate = null;
		}
	}

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Website content not submitted' ) }
					description={
						contentSubmissionDueDate
							? sprintf(
									// translators: contentSubmissionDueDate includes a date, month, and year e.g. "January 1, 2023".
									__(
										'Click the button below to provide the content we need to build your site by %(contentSubmissionDueDate)s.'
									),
									{
										contentSubmissionDueDate: formatDate( contentSubmissionDueDate, locale, {
											dateStyle: 'long',
										} ),
									}
							  )
							: __( 'Click the button below to provide the content we need to build your site.' )
					}
				/>
			}
			size="small"
		>
			<ButtonStack justify="start">
				<Button
					variant="primary"
					href={ `/start/site-content-collection/website-content?siteSlug=${ site.slug }` }
				>
					{ __( 'Provide website content' ) }
				</Button>
			</ButtonStack>
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
		<WebsiteContentSubmissionPending site={ site } />
	);
}
