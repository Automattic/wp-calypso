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
				<div className="primary-address-illustration__window-image" />
			</div>
			<div className="primary-address-illustration__address">
				<Icon icon={ wordpress } size={ 22 } />
				{ /* Not translated: the drawing is laid out for this text length. */ }
				<span>yourgroovydomain.com</span>
				<span className="primary-address-illustration__address-line" />
			</div>
		</div>
	);
}
