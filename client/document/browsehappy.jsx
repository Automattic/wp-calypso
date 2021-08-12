import React from 'react';
import Head from 'calypso/components/head';
import BrowsehappyBody from 'calypso/landing/browsehappy';
import { chunkCssLinks } from './utils';

export default function Browsehappy( { entrypoint, from, wpcomRootUrl } ) {
	return (
		<html lang="en">
			<Head title="Unsupported Browser — WordPress.com">{ chunkCssLinks( entrypoint ) }</Head>
			<BrowsehappyBody from={ from } wpcomRootUrl={ wpcomRootUrl } />
		</html>
	);
}
