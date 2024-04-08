import A4ALogo from 'calypso/components/a4a-logo';

export default function A4ALogoExample() {
	return (
		<div>
			<pre>{ '<A4ALogo />' }</pre>
			<A4ALogo />
			<hr />
			<pre>{ '<A4ALogo full />' }</pre>
			<A4ALogo full size={ 64 } />
		</div>
	);
}
A4ALogoExample.displayName = 'A4ALogoExample';
