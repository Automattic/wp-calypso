import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate, formatCurrency } from 'i18n-calypso';
import { useContext } from 'react';
import { useJetpackAgencyDashboardRecordTrackEvent } from '../../hooks';
import SitesOverviewContext from '../../sites-overview/context';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import './style.scss';

export default function UpgradeLink( { isInline = false } ) {
	const translate = useTranslate();
	const { showLicenseInfo } = useContext( SitesOverviewContext );

	const { products, isLargeScreen } = useContext( DashboardDataContext );
	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( null, isLargeScreen );

	const monthlyProduct = products.find(
		( product ) => product.slug === 'jetpack-monitor' && product.price_interval === 'month'
	);

	const price =
		monthlyProduct &&
		formatCurrency( parseFloat( monthlyProduct.amount ), monthlyProduct.currency );

	const handleOnClick = () => {
		recordEvent( 'downtime_monitoring_upgrade_link_click' );
		showLicenseInfo( 'monitor' );
	};

	return (
		<Button
			className={ clsx( 'upgrade-link', { 'is-inline': isInline } ) }
			borderless
			compact
			onClick={ handleOnClick }
		>
			<span>
				{ price
					? translate( 'Upgrade (%(price)s/m)', {
							args: { price },
							comment: '%price is the price of the upgrade, e.g. $5/m where m is "month"',
					  } )
					: translate( 'Upgrade' ) }
			</span>
		</Button>
	);
}
