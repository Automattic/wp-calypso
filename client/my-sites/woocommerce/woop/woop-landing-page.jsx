import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import CtaHeader from 'calypso/components/cta-header';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

const WoopLandingPage = ( props ) => {
	const { startSetup } = props;
	const navigationItems = [ { label: 'WooCommerce', href: `/woocommerce-installation` } ];
	return (
		<div className="woop-landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems }>
				<Button onClick={ startSetup } primary>
					{ translate( 'Set up my store!' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaHeader
				title={ translate( 'Have something to sell?' ) }
				subtitle={ translate( 'Upgrade to the Premium plan and set up your WooCommerce store.' ) }
				buttonText={ translate( 'Set up my store!' ) }
				buttonAction={ startSetup }
			>
				Right content
			</CtaHeader>
		</div>
	);
};

export default WoopLandingPage;
