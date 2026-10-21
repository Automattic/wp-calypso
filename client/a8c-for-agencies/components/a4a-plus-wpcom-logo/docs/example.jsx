import A4APlusWpComLogo from 'calypso/components/jetpack-plus-wpcom-logo';

export default function A4APlusWpComLogoExample() {
	return (
		<div>
			<pre>{ '<A4APlusWpComLogo />' }</pre>
			<A4APlusWpComLogo />
			<hr />
			<pre>{ '<A4APlusWpComLogo size={ 24 } />' }</pre>
			<A4APlusWpComLogo size={ 24 } />
			<hr />
			<pre>{ '<A4APlusWpComLogo size={ 64 } />' }</pre>
			<A4APlusWpComLogo size={ 64 } />
		</div>
	);
}
A4APlusWpComLogoExample.displayName = 'A4APlusWpComLogoExample';
