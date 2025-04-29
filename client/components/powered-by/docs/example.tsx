import PoweredBy from 'calypso/components/powered-by';

const PoweredByExample = () => {
	return (
		<div>
			<pre>{ '<PoweredBy brand="jetpack" />' }</pre>
			<PoweredBy brand="jetpack" />
			<hr />

			<pre>{ '<PoweredBy brand="jetpack" variant="black" />' }</pre>
			<PoweredBy brand="jetpack" variant="black" />
			<hr />

			<pre>{ '<PoweredBy brand="jetpack" variant="white" />' }</pre>
			<div style={ { background: '#000', padding: '20px', display: 'inline-block' } }>
				<PoweredBy brand="jetpack" variant="white" />
			</div>
			<hr />

			<pre>{ '<PoweredBy brand="woocommerce" />' }</pre>
			<PoweredBy brand="woocommerce" />
			<hr />

			<pre>{ '<PoweredBy brand="woocommerce" variant="black" />' }</pre>
			<PoweredBy brand="woocommerce" variant="black" />
			<hr />

			<pre>{ '<PoweredBy brand="woocommerce" variant="white" />' }</pre>
			<div style={ { background: '#000', padding: '20px', display: 'inline-block' } }>
				<PoweredBy brand="woocommerce" variant="white" />
			</div>
			<hr />

			<pre>{ '<PoweredBy brand="wpcloud" />' }</pre>
			<PoweredBy brand="wpcloud" />
			<hr />

			<pre>{ '<PoweredBy brand="wpcloud" variant="black" />' }</pre>
			<PoweredBy brand="wpcloud" variant="black" />
			<hr />

			<pre>{ '<PoweredBy brand="wpcloud" variant="white" />' }</pre>
			<div style={ { background: '#000', padding: '20px', display: 'inline-block' } }>
				<PoweredBy brand="wpcloud" variant="white" />
			</div>
			<hr />

			<pre>{ '<PoweredBy brand="wpcom" />' }</pre>
			<PoweredBy brand="wpcom" />
			<hr />

			<pre>{ '<PoweredBy brand="wpcom" variant="black" />' }</pre>
			<PoweredBy brand="wpcom" variant="black" />
			<hr />

			<pre>{ '<PoweredBy brand="wpcom" variant="white" />' }</pre>
			<div style={ { background: '#000', padding: '20px', display: 'inline-block' } }>
				<PoweredBy brand="wpcom" variant="white" />
			</div>
		</div>
	);
};

export default PoweredByExample;
