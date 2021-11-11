/**
 * External dependencies
 */
import { Button } from '@automattic/components';
import { useRef } from '@wordpress/element';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import CtaHeader from 'calypso/components/cta-header';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import './style.scss';

const WoopLandingPage = ( props ) => {
	const { startSetup } = props;
	const navigationItems = [ { label: 'WooCommerce', href: `/woocommerce-installation` } ];
	const ctaRef = useRef( null );

	return (
		<div className="woop-landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ startSetup } primary>
					{ translate( 'Set up my store!' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaHeader
				title={ translate( 'Have something to sell?' ) }
				subtitle={ translate( 'Build exactly the eCommerce website you want.' ) }
				buttonText={ translate( 'Set up my store!' ) }
				buttonAction={ startSetup }
				ctaRef={ ctaRef }
			>
				Right content
			</CtaHeader>
		</div>
	);
};

export default WoopLandingPage;
