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
			/* translators: This is a checkbox label. CT is a country-specific tax abbreviation (Colombia Consumption Tax). Use the local name for this tax in your language. Most translators should NOT translate this, but if your locale uses a common translated term (e.g., "moms" in Swedish), use that instead. */
			CT: translate( 'Add CT details', {
				textOnly: true,
			} ),
			/* translators: This is a checkbox label. GST is a country-specific tax abbreviation (Goods and Services Tax, used in Canada, Australia, etc). Use the local name for this tax in your language. Examples: "TPS/TVH" (Quebec/Canada), "GST" (Australia). */
			GST: translate( 'Add GST details', {
				textOnly: true,
			} ),
			/* translators: This is a checkbox label. SST is a country-specific tax abbreviation (Sales and Services Tax, used in Malaysia). Use the local name for this tax in your language. */
			SST: translate( 'Add SST details', {
				textOnly: true,
			} ),
			/* translators: This is a checkbox label. VAT (Value-Added Tax) is used in most European countries and beyond. Use the local abbreviation or term. Examples: "TVA" (French), "IVA" (Spanish/Portuguese), "moms" (Swedish), "MwSt" (German). */
			VAT: translate( 'Add VAT details', {
				textOnly: true,
			} ),
			/* translators: This is a checkbox label. Use this string only if the UI doesn't match a specific country's tax type. List the common tax names appropriate for your locale. */
			fallback: translate( 'Add tax (VAT/GST/CT) details', {
				textOnly: true,
			} ),
		},
		organizationFieldLabel: {
			/* translators: This is a form field label. CT is a country-specific tax abbreviation (Colombia Consumption Tax). Use the local name for this tax in your language. Most translators should NOT translate this, but if your locale uses a common translated term (e.g., "moms" in Swedish), use that instead. */
			CT: translate( 'Organization for CT', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. GST is a country-specific tax abbreviation (Goods and Services Tax, used in Canada, Australia, etc). Use the local name for this tax in your language. Examples: "TPS/TVH" (Quebec/Canada), "GST" (Australia). */
			GST: translate( 'Organization for GST', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. SST is a country-specific tax abbreviation (Sales and Services Tax, used in Malaysia). Use the local name for this tax in your language. */
			SST: translate( 'Organization for SST', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. VAT (Value-Added Tax) is used in most European countries and beyond. Use the local abbreviation or term. Examples: "TVA" (French), "IVA" (Spanish/Portuguese), "moms" (Swedish), "MwSt" (German). */
			VAT: translate( 'Organization for VAT', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. Use this string only if the UI doesn't match a specific country's tax type. List the common tax names appropriate for your locale. */
			fallback: translate( 'Organization for tax (VAT/GST/CT)', {
				textOnly: true,
			} ),
		},
		vatIdFieldLabel: {
			/* translators: This is a form field label. CT is a country-specific tax abbreviation (Colombia Consumption Tax). Use the local name for this tax in your language. Most translators should NOT translate this, but if your locale uses a common translated term (e.g., "moms" in Swedish), use that instead. */
			CT: translate( 'CT ID', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. GST is a country-specific tax abbreviation (Goods and Services Tax, used in Canada, Australia, etc). Use the local name for this tax in your language. Examples: "TPS/TVH" (Quebec/Canada), "GST" (Australia). */
			GST: translate( 'GST ID', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. SST is a country-specific tax abbreviation (Sales and Services Tax, used in Malaysia). Use the local name for this tax in your language. */
			SST: translate( 'SST ID', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. VAT (Value-Added Tax) is used in most European countries and beyond. Use the local abbreviation or term. Examples: "TVA" (French), "IVA" (Spanish/Portuguese), "moms" (Swedish), "MwSt" (German). */
			VAT: translate( 'VAT ID', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. Use this string only if the UI doesn't match a specific country's tax type. List the common tax names appropriate for your locale. */
			fallback: translate( 'Tax ID (VAT/GST/CT)', {
				textOnly: true,
			} ),
		},
		vatAddressFieldLabel: {
			/* translators: This is a form field label. CT is a country-specific tax abbreviation (Colombia Consumption Tax). Use the local name for this tax in your language. Most translators should NOT translate this, but if your locale uses a common translated term (e.g., "moms" in Swedish), use that instead. */
			CT: translate( 'Address for CT', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. GST is a country-specific tax abbreviation (Goods and Services Tax, used in Canada, Australia, etc). Use the local name for this tax in your language. Examples: "TPS/TVH" (Quebec/Canada), "GST" (Australia). */
			GST: translate( 'Address for GST', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. SST is a country-specific tax abbreviation (Sales and Services Tax, used in Malaysia). Use the local name for this tax in your language. */
			SST: translate( 'Address for SST', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. VAT (Value-Added Tax) is used in most European countries and beyond. Use the local abbreviation or term. Examples: "TVA" (French), "IVA" (Spanish/Portuguese), "moms" (Swedish), "MwSt" (German). */
			VAT: translate( 'Address for VAT', {
				textOnly: true,
			} ),
			/* translators: This is a form field label. Use this string only if the UI doesn't match a specific country's tax type. List the common tax names appropriate for your locale. */
			fallback: translate( 'Address for tax (VAT/GST/CT)', {
				textOnly: true,
			} ),
		},
		vatIdChangeExplanation: {
			/* translators: This is an explanation message. CT is a country-specific tax abbreviation (Colombia Consumption Tax). Use the local name for this tax in your language. Most translators should NOT translate this, but if your locale uses a common translated term (e.g., "moms" in Swedish), use that instead. */
			CT: translate(
				'To change your CT ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
				{ components: { contactSupportLink } }
			),
			/* translators: This is an explanation message. GST is a country-specific tax abbreviation (Goods and Services Tax, used in Canada, Australia, etc). Use the local name for this tax in your language. Examples: "TPS/TVH" (Quebec/Canada), "GST" (Australia). */
			GST: translate(
				'To change your GST ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
				{ components: { contactSupportLink } }
			),
			/* translators: This is an explanation message. SST is a country-specific tax abbreviation (Sales and Services Tax, used in Malaysia). Use the local name for this tax in your language. */
			SST: translate(
				'To change your SST ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
				{ components: { contactSupportLink } }
			),
			/* translators: This is an explanation message. VAT (Value-Added Tax) is used in most European countries and beyond. Use the local abbreviation or term. Examples: "TVA" (French), "IVA" (Spanish/Portuguese), "moms" (Swedish), "MwSt" (German). */
			VAT: translate(
				'To change your VAT ID, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
				{ components: { contactSupportLink } }
			),
			/* translators: This is an explanation message. Use this string only if the UI doesn't match a specific country's tax type. List the common tax names appropriate for your locale. */
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
