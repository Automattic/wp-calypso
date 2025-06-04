import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { agencyBlogQuery } from '../../app/queries';
import type { AgencyBlog, Site } from '../../data/types';

function getAgencyBillingMessage( agency: AgencyBlog | undefined, isError: boolean ) {
	if ( ! agency ) {
		return undefined;
	}

	const priceInfoIsDefined =
		Number.isFinite( agency.prices?.actual_price ) && typeof agency.prices?.currency === 'string';

	if ( isError || ! priceInfoIsDefined ) {
		return __( "After launch, we'll bill your agency in the next billing cycle." );
	}

	const { existing_wpcom_license_count: existingWPCOMLicenseCount = 0, name, prices } = agency;
	const price = formatCurrency( prices.actual_price, prices.currency );

	return createInterpolateElement(
		sprintf(
			/* translators: agencyName is the name of the agency that will be billed for the site; licenseCount is the number of licenses the agency will be billed for; price is the price per license */
			_n(
				"After launch, we'll bill %(agencyName)s in the next billing cycle. With %(licenseCount)d production hosting license, you will be charged %(price)s / license / month. <learnMoreLink>Learn more.</learnMoreLink>",
				"After launch, we'll bill %(agencyName)s in the next billing cycle. With %(licenseCount)d production hosting licenses, you will be charged %(price)s / license / month. <learnMoreLink>Learn more.</learnMoreLink>",
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

export function LaunchAgencyDevelopmentSiteForm( {
	site,
	onLaunchClick,
}: {
	site: Site;
	onLaunchClick: () => void;
} ) {
	const { data, isError } = useQuery( agencyBlogQuery( site.ID ) );

	const billingMessage = getAgencyBillingMessage( data, isError );
	const isReferralStatusActive = data?.referral_status === 'active';
	const shouldShowBillingMessage = ! isReferralStatusActive && !! billingMessage;
	const shouldShowReferClientButton = ! isReferralStatusActive;

	return (
		<VStack spacing={ 4 } alignment="left">
			<Text>
				{ __(
					'Your site hasn\'t been launched yet. It is hidden from visitors behind a "Coming Soon" notice until it is launched.'
				) }
			</Text>
			{ shouldShowBillingMessage && <Text>{ billingMessage }</Text> }
			<HStack justify="flex-start">
				<Button variant="primary" onClick={ () => onLaunchClick() }>
					{ __( 'Launch site' ) }
				</Button>
				{ shouldShowReferClientButton && (
					<Button
						variant="secondary"
						href={ `https://agencies.automattic.com/marketplace/checkout?referral_blog_id=${ site.ID }` }
					>
						{ __( 'Refer a client' ) }
					</Button>
				) }
			</HStack>
		</VStack>
	);
}

export function LaunchForm( { site }: { site: Site } ) {
	return (
		<VStack spacing={ 4 } alignment="left">
			<Text>
				{ __(
					'Your site hasn\'t been launched yet. It is hidden from visitors behind a "Coming Soon" notice until it is launched.'
				) }
			</Text>
			<Button
				__next40pxDefaultSize
				variant="primary"
				href={ addQueryArgs( '/start/launch-site', {
					siteSlug: site.slug,
					new: site.name,
					hide_initial_query: 'yes',
				} ) }
			>
				{ __( 'Launch site' ) }
			</Button>
		</VStack>
	);
}
