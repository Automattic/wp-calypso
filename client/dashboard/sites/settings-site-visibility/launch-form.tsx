import { siteAgencyBlogQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import Notice from '../../components/notice';
import { a4aLink } from '../../utils/link';
import { SiteLaunchButton } from '../site-launch-button';
import AgencyDevelopmentSiteLaunchModal from '../site-launch-button/agency-development-site-launch-modal';
import TrialUpsellNotice from './trial-upsell-notice';
import type { AgencyBlog, Site } from '@automattic/api-core';

function getAgencyBillingMessage(
	agency: AgencyBlog | undefined,
	isAgencyQueryError: boolean,
	isBillingTypeBD: boolean
) {
	if ( ! agency ) {
		return undefined;
	}

	if ( isBillingTypeBD ) {
		return createInterpolateElement(
			__(
				'During the site launch process, you will be charged for this site, with the ability to purchase on an annual or monthly term. <learnMoreLink>Learn more</learnMoreLink>'
			),
			{
				learnMoreLink: (
					<ExternalLink
						href="https://agencieshelp.automattic.com/knowledge-base/free-development-licenses-for-wordpress-com-hosting/"
						children={ null }
					/>
				),
			}
		);
	}

	const priceInfoIsDefined =
		Number.isFinite( agency.prices?.actual_price ) && typeof agency.prices?.currency === 'string';

	if ( isAgencyQueryError || ! priceInfoIsDefined ) {
		return __( 'After launch, we’ll bill your agency in the next billing cycle.' );
	}

	const { existing_wpcom_license_count: existingWPCOMLicenseCount = 0, name, prices } = agency;
	const price = formatCurrency( prices.actual_price, prices.currency );

	return createInterpolateElement(
		sprintf(
			/* translators: agencyName is the name of the agency that will be billed for the site; licenseCount is the number of licenses the agency will be billed for; price is the price per license */
			_n(
				'After launch, we’ll bill %(agencyName)s in the next billing cycle. With %(licenseCount)d production hosting license, you will be charged %(price)s / license / month. <learnMoreLink>Learn more</learnMoreLink>',
				'After launch, we’ll bill %(agencyName)s in the next billing cycle. With %(licenseCount)d production hosting licenses, you will be charged %(price)s / license / month. <learnMoreLink>Learn more</learnMoreLink>',
				existingWPCOMLicenseCount + 1
			),
			{
				agencyName: name,
				licenseCount: existingWPCOMLicenseCount + 1,
				price,
			}
		),
		{
			learnMoreLink: (
				<ExternalLink
					href="https://agencieshelp.automattic.com/knowledge-base/free-development-licenses-for-wordpress-com-hosting/"
					children={ null }
				/>
			),
		}
	);
}

export function LaunchAgencyDevelopmentSiteForm( { site }: { site: Site } ) {
	const { data, isError } = useQuery( siteAgencyBlogQuery( site.ID ) );
	const isBillingTypeBD = data?.billing_system === 'billingdragon';
	const billingMessage = getAgencyBillingMessage( data ?? undefined, isError, isBillingTypeBD );
	const isReferralStatusActive = data?.referral_status === 'active';
	const shouldShowBillingMessage = ! isReferralStatusActive && !! billingMessage;
	const shouldShowReferClientButton = ! isReferralStatusActive;

	return (
		<Notice
			title={ __( 'Your site hasn’t been launched yet' ) }
			actions={
				<>
					<SiteLaunchButton
						site={ site }
						tracksContext="agency_site_settings"
						{ ...( isBillingTypeBD
							? {
									launchUrl: a4aLink(
										`/marketplace/checkout/${ site.slug }/a4a_wp_bundle_business_yearly`
									),
							  }
							: { LaunchModal: AgencyDevelopmentSiteLaunchModal } ) }
					/>
					{ shouldShowReferClientButton && (
						<Button
							size="compact"
							variant="secondary"
							href={ `https://agencies.automattic.com/marketplace/checkout?referral_blog_id=${ site.ID }` }
						>
							{ __( 'Refer a client' ) }
						</Button>
					) }
				</>
			}
		>
			<VStack spacing={ 5 } alignment="left">
				<Text as="p">
					{ __( 'It is hidden from visitors behind a “Coming Soon” notice until it is launched.' ) }
				</Text>
				{ shouldShowBillingMessage && <Text as="p">{ billingMessage }</Text> }
			</VStack>
		</Notice>
	);
}

export function LaunchForm( { site }: { site: Site } ) {
	return (
		<>
			<TrialUpsellNotice site={ site } />
			<Notice
				title={ __( 'Your site hasn’t been launched yet' ) }
				actions={ <SiteLaunchButton site={ site } tracksContext="site_settings" /> }
			>
				{ __( 'It is hidden from visitors behind a “Coming Soon” notice until it is launched.' ) }
			</Notice>
		</>
	);
}
