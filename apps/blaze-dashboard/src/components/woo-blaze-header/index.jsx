import classNames from 'classnames';

import './style.scss';

const WooBlazeHeader = ( { className = '' } ) => (
	<header className={ classNames( 'woo-blaze-header', className ) }>
		<h2>Blaze for WooCommerce</h2>
	</header>
);

export default WooBlazeHeader;
