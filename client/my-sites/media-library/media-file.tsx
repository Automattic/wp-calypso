import * as React from 'react';
import { connect } from 'react-redux';
import { mediaURLToProxyConfig } from 'calypso/lib/media/utils';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import ProxiedImage, { ProxiedImageProps, RenderedComponent } from './proxied-image';
import type { ReactNode } from 'react';

export interface MediaFileProps extends Omit< ProxiedImageProps, 'placeholder' > {
	src: string;
	placeholder?: ReactNode;

	component: RenderedComponent;
	proxiedComponent?: RenderedComponent;

	onLoad: () => any;
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
	maxSize,
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
				maxSize={ maxSize }
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
	const isPrivate = !! isPrivateSite( state, siteId ?? 0 );
	const { filePath, query, isRelativeToSiteRoot } = mediaURLToProxyConfig( src, siteSlug );
	const useProxy = ( isAtomic && isPrivate && filePath && isRelativeToSiteRoot ) as boolean;

	return {
		query,
		siteSlug,
		useProxy,
		filePath,
	};
} )( MediaFile );
