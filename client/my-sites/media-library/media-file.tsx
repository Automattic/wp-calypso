/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getUrlParts } from 'lib/url/url-parts';
import isPrivateSite from 'state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import ProxiedImage, { RenderedComponent } from './proxied-image';

const parseMediaURL = ( url: string, siteSlug: string ) => {
	const { pathname, search: query, hostname } = getUrlParts( url );
	let filePath = pathname;
	let isRelativeToSiteRoot = true;
	if (
		hostname !== siteSlug &&
		( hostname.endsWith( 'wp.com' ) || hostname.endsWith( 'wordpress.com' ) )
	) {
		const [ first, ...rest ] = filePath.substr( 1 ).split( '/' );
		filePath = '/' + rest.join( '/' );

		if ( first !== siteSlug ) {
			isRelativeToSiteRoot = false;
		}
	}

	return {
		query,
		filePath,
		isRelativeToSiteRoot,
	};
};

export interface MediaFileProps {
	src: string;

	component: RenderedComponent;
	proxiedComponent?: RenderedComponent;
	filePath: string;
	query: string;
	siteSlug: string;
	onLoad: () => any;
	placeholder: React.ReactNode | null;
	useProxy: boolean;
	dispatch: any;
}

const MediaFile: React.FC< MediaFileProps > = function MediaFile( {
	src,
	query,
	filePath,
	siteSlug,
	useProxy = false,
	placeholder = null,
	dispatch,
	component: Component,
	proxiedComponent,
	...rest
} ) {
	if ( useProxy ) {
		return (
			<ProxiedImage
				siteSlug={ siteSlug }
				filePath={ filePath }
				query={ query }
				component={ proxiedComponent || Component }
				placeholder={ placeholder }
				{ ...rest }
			/>
		);
	}

	/* eslint-disable-next-line jsx-a11y/alt-text */
	return <Component src={ src } { ...rest } />;
};

MediaFile.defaultProps = {
	placeholder: null,
	component: 'img',
};

export default connect( ( state, { src }: Pick< MediaFileProps, 'src' > ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state ) as string;
	const isAtomic = !! isSiteAutomatedTransfer( state, siteId as number );
	const isPrivate = !! isPrivateSite( state, siteId );
	const { filePath, query, isRelativeToSiteRoot } = parseMediaURL( src, siteSlug );
	const useProxy = ( isAtomic && isPrivate && filePath && isRelativeToSiteRoot ) as boolean;

	return {
		query,
		siteSlug,
		useProxy,
		filePath,
	};
} )( MediaFile );
