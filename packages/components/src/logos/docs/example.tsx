import CloudLogo from '../cloud-logo';
import { JetpackLogo } from '../jetpack-logo';
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
				<VIPLogo />
			</div>
			<div className="logo-container">
				<WooLogo />
			</div>
		</div>
	);
}

ProductLogoExample.displayName = 'ProductLogoExample';
