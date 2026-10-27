import { __ } from '@wordpress/i18n';
import { Icon, wordpress } from '@wordpress/icons';

export default function PrimaryAddressIllustration() {
	return (
		<div className="primary-address-illustration" aria-hidden="true">
			<div className="primary-address-illustration__window">
				<div className="primary-address-illustration__window-dots">
					<span />
					<span />
					<span />
				</div>
				<div className="primary-address-illustration__window-line" />
				<div className="primary-address-illustration__window-image" />
			</div>
			<div className="primary-address-illustration__address">
				<Icon icon={ wordpress } size={ 22 } />
				<span>{ __( 'your-primary-address.com' ) }</span>
			</div>
		</div>
	);
}
