import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackComMasterbar from 'calypso/jetpack-cloud/sections/pricing/jpcom-masterbar';
import { preventWidows } from 'calypso/lib/formatting';
import './style.scss';

export default function Header() {
	const translate = useTranslate();
	const title = translate( 'Security, performance, and growth tools for WordPress' );

	return (
		<>
			<JetpackComMasterbar />
			<div className={ clsx( 'header' ) }>
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows( title ) }
					align="center"
				/>
			</div>
		</>
	);
}
