/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';
import Smooch from 'smooch';
/**
 * Internal Dependencies
 */
import { BackButton } from './back-button';

export function HelpCenterMessenger(): JSX.Element {
	useEffect( () => {
		const s = document.createElement( 'script' );
		s.type = 'text/javascript';
		s.innerHTML =
			'!function(o,d,s,e,f){var i,a,p,c=[],h=[];function t(){var t="You must provide a supported major version.";try{if(!f)throw new Error(t);var e,n="https://cdn.smooch.io/",r="smooch";e="string"==typeof this.response?JSON.parse(this.response):this.response;var o=f.match(/([0-9]+).?([0-9]+)?.?([0-9]+)?/),s=o&&o[1],i=o&&o[2],a=o&&o[3],p=e["v"+s],c=e["v"+s+"."+i+".patch"];if(e.url||p||c){var h=d.getElementsByTagName("script")[0],u=d.createElement("script");if(u.async=!0,a)u.src=c||n+r+"."+f+".min.js";else{if(!(5<=s&&p))throw new Error(t);u.src=p}h.parentNode.insertBefore(u,h)}}catch(e){e.message===t&&console.error(e)}}o[s]={init:function(){i=arguments;var t={then:function(e){return h.push({type:"t",next:e}),t},catch:function(e){return h.push({type:"c",next:e}),t}};return t},on:function(){c.push(arguments)},render:function(){a=arguments},destroy:function(){p=arguments}},o.__onWebMessengerHostReady__=function(e){if(delete o.__onWebMessengerHostReady__,o[s]=e,i)for(var t=e.init.apply(e,i),n=0;n<h.length;n++){var r=h[n];t="t"===r.type?t.then(r.next):t.catch(r.next)}a&&e.render.apply(e,a),p&&e.destroy.apply(e,p);for(n=0;n<c.length;n++)e.on.apply(e,c[n])};var n=new XMLHttpRequest;n.addEventListener("load",t),n.open("GET","https://"+e+".webloader.smooch.io/",!0),n.responseType="json",n.send()}(window,document,"Smooch","624dbbd4e6b51f00f3e3864a","5");';
		document.body.appendChild( s );
	} );
	return (
		<div className="help-center__container-content-odie">
			<div className="help-center__container-odie-header">
				<BackButton className="help-center__container-odie-back-button" />
			</div>
			<div id="messenger-container"></div>
		</div>
	);
}
