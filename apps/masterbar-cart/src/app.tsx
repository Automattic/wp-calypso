import React from 'react';
import ReactDom from 'react-dom';
import MasterbarCart from 'calypso/layout/masterbar/masterbar-cart';

async function AppBoot() {
	ReactDom.render( <MasterbarCart />, document.getElementById( 'masterbar-cart-area' ) );
}

AppBoot();
