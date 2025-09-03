import { CompactCard, Card } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import CardHeading from 'calypso/components/card-heading';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useRecordVatEvents from './use-record-vat-events';
import useVatDetails from './use-vat-details';
import VatForm from './vat-form';
import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

export default function VatInfoPage() {
	const translate = useTranslate();
	const { data: geoData } = useGeoLocationQuery();
	const { fetchError, vatDetails } = useVatDetails();
	const taxName = useTaxName(
		vatDetails.country ?? vatDetails.country ?? geoData?.country_short ?? 'GB'
	);

	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	const reduxDispatch = useDispatch();

	/* This is a call to action for contacting support */
	const contactSupportLinkTitle = translate( 'Contact Happiness Engineers' );

	const taxSupportPageURL = localizeUrl( 'https://wordpress.com/support/vat-gst-other-taxes/' );

	/* This is the title of the support page from https://wordpress.com/support/vat-gst-other-taxes/ */
	const taxSupportPageLinkTitle = translate( 'VAT, GST, and other taxes' );

	const handleOpenCenterChat = useCallback(
		( e: React.MouseEvent< HTMLAnchorElement > ) => {
			e.preventDefault();
			setNavigateToRoute( '/odie' );
			setShowHelpCenter( true );
			reduxDispatch( recordTracksEvent( 'calypso_vat_details_support_click' ) );
		},
		[ reduxDispatch, setNavigateToRoute, setShowHelpCenter ]
	);

	useRecordVatEvents( { fetchError } );

	if ( fetchError ) {
		return (
			<div className="vat-info">
				<CompactCard>
					{
						/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
						translate( 'An error occurred while fetching %s details.', {
							textOnly: true,
							args: [ taxName ?? translate( 'VAT', { textOnly: true } ) ],
						} )
					}
				</CompactCard>
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
		<Layout className="vat-info">
			<Column type="main">
				<CompactCard className="vat-info__form">
					<VatForm />
				</CompactCard>
			</Column>
			<Column type="sidebar">
				<Card className="vat-info__sidebar-card">
					<CardHeading tagName="h1" size={ 16 } isBold className="vat-info__sidebar-title">
						{ title }
					</CardHeading>
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
											showText
											showIcon={ false }
											supportPostId={ 234670 } //This is what makes the document appear in a dialogue
											linkTitle={ taxSupportPageLinkTitle }
										/>
									),
								},
							}
						) }
					</p>
				</Card>
			</Column>
		</Layout>
	);
}
