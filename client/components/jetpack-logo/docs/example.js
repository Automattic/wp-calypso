import JetpackLogo from 'calypso/components/jetpack-logo';

export default function JetpackLogoExample() {
	return (
		<div>
			<pre>{ '<JetpackLogo />' }</pre>
			<JetpackLogo />
			<hr />
			<pre>{ '<JetpackLogo size={ 24 } monochrome />' }</pre>
			<JetpackLogo size={ 24 } monochrome />
			<hr />
			<pre>{ '<JetpackLogo full size={ 64 } />' }</pre>
			<JetpackLogo full size={ 64 } />
			<hr />
			<pre>{ '<JetpackLogo full monochrome />' }</pre>
			<JetpackLogo full monochrome />
		</div>
	);
}
JetpackLogoExample.displayName = 'JetpackLogoExample';
