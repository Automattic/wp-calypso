import WPCloudLogo from 'calypso/components/wp-cloud-logo';

function WPCloudLogoExample() {
	return (
		<div>
			<pre>{ '<WPCloudLogo />' }</pre>
			<WPCloudLogo />
			<hr />
			<pre>{ '<WPCloudLogo size={ 156 } variant="black" />' }</pre>
			<WPCloudLogo size={ 156 } variant="black" />
			<hr />
			<pre>{ '<WPCloudLogo size={ 156 } variant="white" style={{ background: "#000" }} />' }</pre>
			<div style={ { background: '#000', padding: '20px', display: 'inline-block' } }>
				<WPCloudLogo size={ 156 } variant="white" />
			</div>
		</div>
	);
}

export default WPCloudLogoExample;
