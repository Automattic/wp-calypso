/**
 * External dependencies
 */
import React, { Component } from 'react';

class OlarkChat extends Component {
	componentDidMount() {
		const { identity } = this.props;
		const script = document.createElement( 'script' );
		script.setAttribute( 'id', 'olark-chat' );
		script.setAttribute( 'type', 'text/javascript' );
		script.setAttribute( 'async', true );
		script.innerHTML = `
			;(function(o,l,a,r,k,y){if(o.olark)return; r="script";y=l.createElement(r);r=l.getElementsByTagName(r)[0]; y.async=1;y.src="//"+a;r.parentNode.insertBefore(y,r); y=o.olark=function(){k.s.push(arguments);k.t.push(+new Date)}; y.extend=function(i,j){y("extend",i,j)}; y.identify=function(i){y("identify",k.i=i)}; y.configure=function(i,j){y("configure",i,j);k.c[i]=j}; k=y._={s:[],t:[+new Date],c:{},l:a}; })(window,document,"static.olark.com/jsclient/loader.js");
			olark.identify('${ identity }');
		`;
		document.body.appendChild( script );
	}

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return <div id="olark-chat" />;
	}
}

export default OlarkChat;
