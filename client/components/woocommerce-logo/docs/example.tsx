import WooCommerceLogo from 'calypso/components/woocommerce-logo';

function WooCommerceLogoExample() {
	return (
		<div>
			<pre>{ '<WooCommerceLogo />' }</pre>
			<WooCommerceLogo />
			<hr />
			<pre>{ '<WooCommerceLogo size={ 112 } variant="color" />' }</pre>
			<WooCommerceLogo size={ 112 } variant="color" />
			<hr />
			<pre>{ '<WooCommerceLogo size={ 112 } variant="black" />' }</pre>
			<WooCommerceLogo size={ 112 } variant="black" />
			<hr />
			<pre>
				{ '<WooCommerceLogo size={ 112 } variant="white" style={{ background: "#000" }} />' }
			</pre>
			<div style={ { background: '#000', padding: '20px', display: 'inline-block' } }>
				<WooCommerceLogo size={ 112 } variant="white" />
			</div>
		</div>
	);
}

export default WooCommerceLogoExample;
