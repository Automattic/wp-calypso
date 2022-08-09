import { useTranslate } from 'i18n-calypso';

export default function PreinstalledPremiumPluginPriceDisplay( {
	className,
	period,
	pluginSlug,
	price,
} ) {
	const translate = useTranslate();

	if ( 'jetpack-search' === pluginSlug ) {
		return translate( '{{span}}From{{/span}} %(price)s {{span}}%(period)s{{/span}}', {
			args: { price, period },
			components: { span: <span className={ className } /> },
			comment:
				'`price` already includes the currency symbol; `period` can be monthly or yearly. Example: "From $100 monthly"',
		} );
	}
	return translate( '%(price)s {{span}}%(period)s{{/span}}', {
		args: { price, period },
		components: { span: <span className={ className } /> },
		comment:
			'`price` already includes the currency symbol; `period` can be monthly or yearly. Example: "$100 monthly"',
	} );
}
