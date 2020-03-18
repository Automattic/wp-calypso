/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { useProxiedFileUrl } from 'lib/media/use-proxied-file-url';

type RenderedComponentProps = {
	src: string;
	[ key: string ]: any;
};
export type RenderedComponent = string | React.ComponentType< RenderedComponentProps >;

interface Props {
	query: string;
	filePath: string;
	siteSlug: string;
	placeholder: React.ReactNode | null;
	component: RenderedComponent;

	[ key: string ]: any;
}

const ProxiedFile: React.FC< Props > = function ProxiedImage( {
	siteSlug,
	filePath,
	query,
	placeholder,
	component: Component,
	...rest
} ) {
	const [ imageObjectUrl ] = useProxiedFileUrl( filePath, siteSlug, query );

	if ( ! imageObjectUrl ) {
		return placeholder as React.ReactElement;
	}

	/* eslint-disable-next-line jsx-a11y/alt-text */
	return <Component src={ imageObjectUrl } { ...rest } />;
};

ProxiedFile.defaultProps = {
	placeholder: null,
};

export default ProxiedFile;
