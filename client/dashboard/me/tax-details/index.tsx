import { useResetSupportInteraction } from '@automattic/help-center/src/hooks/use-reset-support-interaction';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useDispatch as useDataStoreDispatch, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
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

const HELP_CENTER_STORE = 'automattic/help-center';

export default function UserTaxInfoPage() {
	const { recordTracksEvent } = useAnalytics();
	const translate = useTranslate();
	const { data: geoData } = useGeoLocationQuery();
	const { fetchError, userTaxDetails } = useUserTaxDetails();
	const taxName = useTaxName(
		userTaxDetails.country ?? userTaxDetails.country ?? geoData?.country_short ?? 'GB'
	);
	const resetSupportInteraction = useResetSupportInteraction();

	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	const reduxDispatch = useDispatch();

	/* This is a call to action for contacting support */
	const contactSupportLinkTitle = translate( 'Contact Happiness Engineers' );

	const taxSupportPageURL = localizeUrl( 'https://wordpress.com/support/vat-gst-other-taxes/' );

	/* This is the title of the support page from https://wordpress.com/support/vat-gst-other-taxes/ */
	const taxSupportPageLinkTitle = translate( 'VAT, GST, and other taxes' );

	const handleOpenCenterChat = useCallback(
		async ( e: React.MouseEvent< HTMLAnchorElement > ) => {
			e.preventDefault();
			setNavigateToRoute( '/odie' );
			setShowHelpCenter( true );
			await resetSupportInteraction();
			reduxDispatch( recordTracksEvent( 'calypso_vat_details_support_click' ) );
		},
		[
			reduxDispatch,
			recordTracksEvent,
			resetSupportInteraction,
			setNavigateToRoute,
			setShowHelpCenter,
		]
	);

	useRecordUserTaxEvents( { fetchError } );

	if ( fetchError ) {
		return (
			<div className="vat-info">
				<Card>
					<CardBody>
						{
							/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
							translate( 'An error occurred while fetching %s details.', {
								textOnly: true,
								args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
							} )
						}
					</CardBody>
				</Card>
			</div>
		);
	}

	const genericTaxName =
		/* translators: This is a generic name for taxes to use when we do not know the user's country. */
		translate( 'tax (VAT/GST/CT)' );
	const fallbackTaxName = genericTaxName;
	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const title = translate( 'Add %s details', {
		textOnly: true,
		args: [ taxName ?? fallbackTaxName ],
	} );

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
							<p className="vat-info__sidebar-paragraph">
								{ translate(
									/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST") or a generic fallback string of tax names */
									'The %(taxName)s details saved on this page will be applied to all receipts in your account.',
									{
										args: { taxName: taxName ?? fallbackTaxName },
									}
								) }
								<br />
								<br />
								{ translate(
									/* translators: This is a list of tax-related reasons a customer might need to contact support */
									'If you:' +
										'{{ul}}' +
										/* translators: %(taxName)s is the name of taxes in the country (eg: "VAT" or "GST") or a generic fallback string of tax names */
										'{{li}}Need to update existing %(taxName)s details{{/li}}' +
										'{{li}}Have been charged taxes as a business subject to reverse charges{{/li}}' +
										'{{li}}Do not see your country listed in this form{{/li}}' +
										'{{/ul}}' +
										'{{contactSupportLink}}Contact our Happiness Engineers{{/contactSupportLink}}. Include your %(taxName)s number and country code when you contact us.',
									{
										args: { taxName: taxName ?? fallbackTaxName },
										components: {
											ul: <ul />,
											li: <li />,
											contactSupportLink: (
												<a
													href="/help"
													title={ contactSupportLinkTitle }
													onClick={ handleOpenCenterChat }
												/>
											),
										},
									}
								) }
								<br />
								<br />
								{ translate(
									'For more information about taxes, {{learnMoreLink}}click here{{/learnMoreLink}}.',
									{
										components: {
											learnMoreLink: (
												<InlineSupportLink
													supportLink={ taxSupportPageURL }
													showIcon={ false }
													supportPostId={ 234670 } //This is what makes the document appear in a dialogue
													linkTitle={ taxSupportPageLinkTitle }
												/>
											),
										},
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
