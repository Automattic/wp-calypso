import CloudLogo from '../cloud-logo';
import CNNLogo from '../cnn-logo';
import JetpackLogo from '../jetpack-logo';
import SalesforceLogo from '../salesforce-logo';
import SlackLogo from '../slack-logo';
import VIPLogo from '../vip-logo';
import WooLogo from '../woo-logo';

import './style.scss';
export default function ProductLogoExample() {
	return (
		<div className="example-container">
			<div className="logo-container">
				<JetpackLogo />
			</div>
			<div className="logo-container">
				<CloudLogo />
			</div>
			<div className="logo-container">
				<CNNLogo />
			</div>
			<div className="logo-container">
				<SalesforceLogo />
			</div>
			<div className="logo-container">
				<SlackLogo />
			</div>
			<div className="logo-container">
				<VIPLogo />
			</div>
			<div className="logo-container">
				<WooLogo />
			</div>
		</div>
	);
}

ProductLogoExample.displayName = 'ProductLogoExample';
