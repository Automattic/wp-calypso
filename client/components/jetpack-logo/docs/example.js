import JetpackLogo from 'calypso/components/jetpack-logo';

export default function JetpackLogoExample() {
	return (
		<div>
			<pre>{ '<JetpackLogo />' }</pre>
			<JetpackLogo />
			<hr />
			<pre>{ '<JetpackLogo size={ 24 } />' }</pre>
			<JetpackLogo size={ 24 } />
			<hr />
			<pre>{ '<JetpackLogo full size={ 64 } />' }</pre>
			<JetpackLogo full size={ 64 } />
			<hr />
			<pre>{ '<JetpackLogo full variant="color" />' }</pre>
			<JetpackLogo full variant="color" />
			<hr />
			<pre>{ '<JetpackLogo full variant="black" />' }</pre>
			<JetpackLogo full variant="black" />
			<hr />
			<pre>{ '<JetpackLogo full variant="white" style={{ background: "#222" }} />' }</pre>
			<div style={ { background: '#222', display: 'inline-block', padding: 8 } }>
				<JetpackLogo full variant="white" />
			</div>
		</div>
	);
}
JetpackLogoExample.displayName = 'JetpackLogoExample';
