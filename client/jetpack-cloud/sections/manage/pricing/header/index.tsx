import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';
import './style.scss';

export default function Header() {
	const translate = useTranslate();
	const title = translate( 'Bulk discounts and flexible billing to suit your needs' );

	return (
		<>
			<div className={ clsx( 'header' ) }>
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows( title ) }
					align="center"
				/>
				<div className="header__sub-title">
					{ translate(
						'Get the best rates in Jetpack Manage enabling you to package your services however you wish'
					) }
				</div>
			</div>
		</>
	);
}
