import { useSuspenseQuery } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteDifmWebsiteContentQuery } from '../../app/queries/site-do-it-for-me';
import { siteDomainsQuery } from '../../app/queries/site-domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasGSuiteWithUs, hasTitanMailWithUs } from '../../utils/domain-features';
import './style.scss';

const SiteDifmLiteInProgress = ( { siteSlug }: { siteSlug: string } ) => {
	const { recordTracksEvent } = useAnalytics();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: isSubmitted } = useSuspenseQuery( {
		...siteDifmWebsiteContentQuery( site.ID ),
		select: ( data ) => data.is_website_content_submitted,
	} );
	const { data: primaryDomain } = useSuspenseQuery( {
		...siteDomainsQuery( site.ID ),
		select: ( data ) => data.find( ( domain ) => domain.primary_domain ),
	} );

	if ( isSubmitted ) {
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
							{ args: [ 4 ] }
						) }
					/>
				}
				size="small"
			>
				<HStack spacing={ 4 } justify="start">
					<Button variant="primary">{ __( 'Manage domain' ) }</Button>
					<Button variant="secondary" onClick={ recordEmailClick }>
						{ hasEmailWithUs ? __( 'Manage email' ) : __( 'Add email' ) }
					</Button>
				</HStack>
			</PageLayout>
		);
	}

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
};

export default SiteDifmLiteInProgress;
