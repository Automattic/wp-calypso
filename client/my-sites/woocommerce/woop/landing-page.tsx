/**
 * External dependencies
 */
import { Button } from '@automattic/components';
import { useRef } from '@wordpress/element';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import CtaSection from 'calypso/components/cta-section';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import './style.scss';

interface Props {
	startSetup: () => void;
}

const WoopLandingPage: React.FunctionComponent< Props > = ( props ) => {
	const { startSetup } = props;
	const navigationItems = [ { label: 'WooCommerce', href: `/woocommerce-installation` } ];
	const ctaRef = useRef( null );

	return (
		<div className="woop__landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ startSetup } primary>
					{ translate( 'Set up my store!' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaSection
				title={ translate( 'Have something to sell?' ) }
				headline={ translate( 'Build exactly the eCommerce website you want.' ) }
				buttonText={ translate( 'Set up my store!' ) }
				buttonAction={ startSetup }
				ctaRef={ ctaRef }
			>
				Right content
			</CtaSection>
		</div>
	);
};

export default WoopLandingPage;
