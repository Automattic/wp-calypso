import { useResetSupportInteraction } from '@automattic/help-center/src/hooks/use-reset-support-interaction';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { useTaxName } from '../../app/hooks/use-country-list';
import { useGeoLocationQuery } from '../../app/queries/geolocation';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { localizeUrl } from './localize-url';
import useRecordUserTaxEvents from './use-record-user-tax-events';
import useUserTaxDetails from './use-user-tax-details';
import UserTaxForm from './user-tax-form';
import './style.scss';

export default function UserTaxInfoPage() {
	const { recordTracksEvent } = useAnalytics();
	const { data: geoData } = useGeoLocationQuery();
	const { fetchError, userTaxDetails } = useUserTaxDetails();
	const taxName = useTaxName(
		userTaxDetails.country ?? userTaxDetails.country ?? geoData?.country_short ?? 'GB'
	);
	const resetSupportInteraction = useResetSupportInteraction();

	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	/* This is a call to action for contacting support */
	const contactSupportLinkTitle = __( 'Contact Happiness Engineers' );

	const taxSupportPageURL = localizeUrl( 'https://wordpress.com/support/vat-gst-other-taxes/' );

	/* This is the title of the support page from https://wordpress.com/support/vat-gst-other-taxes/ */
	const taxSupportPageLinkTitle = __( 'VAT, GST, and other taxes' );

	const handleOpenCenterChat = useCallback(
		async ( e: React.MouseEvent< HTMLAnchorElement > ) => {
			e.preventDefault();
			setNavigateToRoute( '/odie' );
			setShowHelpCenter( true );
			await resetSupportInteraction();
			recordTracksEvent( 'calypso_vat_details_support_click' );
		},
		[ recordTracksEvent, resetSupportInteraction, setNavigateToRoute, setShowHelpCenter ]
	);

	useRecordUserTaxEvents( { fetchError } );

	if ( fetchError ) {
		return (
			<div>
				<Card>
					<CardBody>
						{ sprintf(
							/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
							__( 'An error occurred while fetching %s details.' ),
							taxName ?? __( 'VAT' )
						) }
					</CardBody>
				</Card>
			</div>
		);
	}

	const genericTaxName =
		/* translators: This is a generic name for taxes to use when we do not know the user's country. */
		__( 'tax (VAT/GST/CT)' );
	const fallbackTaxName = genericTaxName;
	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const title = sprintf( __( 'Add %s details' ), taxName ?? fallbackTaxName );

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Tax Details' ) } /> }>
			<HStack spacing={ 6 } alignment="top">
				<VStack className="user-tax-info__form">
					<Card>
						<CardBody>
							<UserTaxForm />
						</CardBody>
					</Card>
				</VStack>
				<VStack>
					<Card className="user-tax-info__sidebar">
						<CardBody>
							<h2>{ title }</h2>
							<p>
								{ sprintf(
									/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST") or a generic fallback string of tax names */
									__(
										'The %(taxName)s details saved on this page will be applied to all receipts in your account.'
									),
									{
										taxName: taxName ?? fallbackTaxName,
									}
								) }
								<br />
								<br />
								{ createInterpolateElement(
									sprintf(
										/* translators: This is a list of tax-related reasons a customer might need to contact support */
										__(
											'If you:' +
												'{{ul}}' +
												/* translators: %(taxName)s is the name of taxes in the country (eg: "VAT" or "GST") or a generic fallback string of tax names */
												'{{li}}Need to update existing %(taxName)s details{{/li}}' +
												'{{li}}Have been charged taxes as a business subject to reverse charges{{/li}}' +
												'{{li}}Do not see your country listed in this form{{/li}}' +
												'{{/ul}}' +
												'{{contactSupportLink}}Contact our Happiness Engineers{{/contactSupportLink}}. Include your %(taxName)s number and country code when you contact us.'
										)
											.replaceAll( '{{ul}}', '<ul>' )
											.replaceAll( '{{/ul}}', '</ul>' )
											.replaceAll( '{{li}}', '<li>' )
											.replaceAll( '{{/li}}', '</li>' )
											.replaceAll( '{{contactSupportLink}}', '<contactSupportLink>' )
											.replaceAll( '{{/contactSupportLink}}', '</contactSupportLink>' ),
										{ taxName: taxName ?? fallbackTaxName }
									),
									{
										ul: <ul />,
										li: <li />,
										contactSupportLink: (
											<a
												href="/help"
												title={ contactSupportLinkTitle }
												onClick={ handleOpenCenterChat }
											/>
										),
									}
								) }
								<br />
								<br />
								{ createInterpolateElement(
									__(
										'For more information about taxes, {{learnMoreLink}}click here{{/learnMoreLink}}.'
									)
										.replaceAll( '{{learnMoreLink}}', '<learnMoreLink>' )
										.replaceAll( '{{/learnMoreLink}}', '</learnMoreLink>' ),
									{
										learnMoreLink: (
											<InlineSupportLink
												supportLink={ taxSupportPageURL }
												supportPostId={ 234670 } //This is what makes the document appear in a dialogue
												title={ taxSupportPageLinkTitle }
											/>
										),
									}
								) }
							</p>
						</CardBody>
					</Card>
				</VStack>
			</HStack>
		</PageLayout>
	);
}
