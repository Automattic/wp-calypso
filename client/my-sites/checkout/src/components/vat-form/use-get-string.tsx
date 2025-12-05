import { CALYPSO_CONTACT } from '@automattic/urls';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const TAX_NAMES = [ 'CT', 'GST', 'SST', 'VAT' ] as const;
type TaxName = ( typeof TAX_NAMES )[ number ];

type VatStringsKey = TaxName | 'fallback';
type VatStringsValue = {
	addVatCheckboxLabel: Record< VatStringsKey, string >;
	organizationFieldLabel: Record< VatStringsKey, string >;
	vatIdFieldLabel: Record< VatStringsKey, string >;
	vatAddressFieldLabel: Record< VatStringsKey, string >;
	vatIdChangeExplanation: Record< VatStringsKey, TranslateResult >;
};

export function useGetVatFormString( countryCode: string | undefined ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const untypedTaxName = useTaxName( countryCode ?? 'GB', 'en' );
	const taxName: TaxName | undefined = TAX_NAMES.find( ( taxName ) => taxName === untypedTaxName );

	const contactSupportLink = (
		<a
			target="_blank"
			href={ CALYPSO_CONTACT }
			rel="noreferrer"
			onClick={ () => {
				reduxDispatch( recordTracksEvent( 'calypso_vat_details_support_click' ) );
			} }
		/>
	);

	const VAT_STRINGS: VatStringsValue = {
		addVatCheckboxLabel: {
			/* translators: This is a checkbox label. CT is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			CT: translate( 'Add CT details', {
				textOnly: true,
			} ),
			/* translators: This is a checkbox label. GST is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			GST: translate( 'Add GST details', {
				textOnly: true,
			} ),
			/* translators: This is a checkbox label. SST is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			SST: translate( 'Add SST details', {
				textOnly: true,
			} ),
			/* translators: This is a checkbox label. VAT is Value-Added Tax. Translate to something that makes sense in the current locale */
			VAT: translate( 'Add VAT details', {
				textOnly: true,
			} ),
			/* translators: This is a checkbox label */
			fallback: translate( 'Add tax (VAT/GST/CT) details', {
				textOnly: true,
			} ),
		},
		organizationFieldLabel: {
			/* translators: This is a form field label. CT is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			CT: translate( 'Organization for CT', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. GST is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			GST: translate( 'Organization for GST', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. SST is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			SST: translate( 'Organization for SST', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. VAT is Value-Added Tax. Translate to something that makes sense in the current locale */
			VAT: translate( 'Organization for VAT', {
				textOnly: true,
			} ),
			/* translators: This is a form field label */
			fallback: translate( 'Organization for tax (VAT/GST/CT)', {
				textOnly: true,
			} ),
		},
		vatIdFieldLabel: {
			/* translators: This is a form field label. CT is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			CT: translate( 'CT ID', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. GST is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			GST: translate( 'GST ID', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. SST is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			SST: translate( 'SST ID', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. VAT is Value-Added Tax. Translate to something that makes sense in the current locale */
			VAT: translate( 'VAT ID', {
				textOnly: true,
			} ),
			/* translators: This is a form field label */
			fallback: translate( 'Tax ID (VAT/GST/CT)', {
				textOnly: true,
			} ),
		},
		vatAddressFieldLabel: {
			/* translators: This is a form field label. CT is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			CT: translate( 'Address for CT', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. GST is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			GST: translate( 'Address for GST', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. SST is a localized name of Value-Added Tax (VAT). Preserve the name of the tax in the translation */
			SST: translate( 'Address for SST', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. VAT is Value-Added Tax. Translate to something that makes sense in the current locale */
			VAT: translate( 'Address for VAT', {
				textOnly: true,
			} ),
			/* translators: This is a form field label */
			fallback: translate( 'Address for tax (VAT/GST/CT)', {
				textOnly: true,
			} ),
		},
		vatIdChangeExplanation: {
			/* translators: This is a form field label. CT is a localized name of Value-Added Tax (VAT). Translate to something sensible for the current locale */
			CT: translate(
				'To change your CT ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
				{ components: { contactSupportLink } }
			),
			/* translators: This is a form field label. GST is a localized name of Value-Added Tax (VAT). Translate to something sensible for the current locale */
			GST: translate(
				'To change your GST ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
				{ components: { contactSupportLink } }
			),
			/* translators: This is a form field label. SST is a localized name of Value-Added Tax (VAT). Translate to something sensible for the current locale */
			SST: translate(
				'To change your SST ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
				{ components: { contactSupportLink } }
			),
			/* translators: This is a form field label. VAT is Value-Added Tax. Translate to something that makes sense in the current locale */
			VAT: translate(
				'To change your VAT ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
				{ components: { contactSupportLink } }
			),
			/* translators: This is a form field label */
			fallback: translate(
				'To change your tax ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
				{ components: { contactSupportLink } }
			),
		},
	};

	return function getVatString< K extends keyof VatStringsValue >(
		key: K
	): VatStringsValue[ K ][ VatStringsKey ] {
		return VAT_STRINGS[ key ][ taxName ?? 'fallback' ];
	};
}
