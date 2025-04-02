import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import FooterMenu from '../footer-menu';
import './style.scss';

function Footer() {
	return (
		<HStack
			as="footer"
			className="dashboard-footer"
			alignment="left"
			spacing={ 10 }
			justify="flex-start"
		>
			<div style={ { flexGrow: 1 } }>{ __( 'Designed with WordPress' ) }</div>
			<div>
				<FooterMenu />
			</div>
		</HStack>
	);
}

export default Footer;
