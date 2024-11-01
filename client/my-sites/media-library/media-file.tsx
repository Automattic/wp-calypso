import config from '@automattic/calypso-config';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { mediaURLToProxyConfig } from 'calypso/lib/media/utils';
import GoogleProxiedImage from 'calypso/my-sites/media-library/google-proxied-image';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { IAppState } from 'calypso/state/types';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import ProxiedImage, { ProxiedImageProps, RenderedComponent } from './proxied-image';
import type { ReactNode } from 'react';

export interface MediaFileProps extends Omit< ProxiedImageProps, 'placeholder' > {
	src: string;
	placeholder?: ReactNode;

	component: RenderedComponent;
	proxiedComponent?: RenderedComponent;

	onLoad?: () => void;
	useProxy?: boolean;
	dispatch?: Dispatch;
}

const MediaFile: React.FC< MediaFileProps > = function MediaFile( {
	src,
	query,
	filePath,
	siteId,
	siteSlug,
	useProxy = false,
	useGoogleProxy = false,
	placeholder = null,
	maxSize,
	component: Component = 'img',
	proxiedComponent,
	dispatch, // Destructure to avoid passing to children
	...rest
} ) {
	if ( useProxy ) {
		return (
			<ProxiedImage
				siteId={ siteId || siteSlug }
				filePath={ filePath }
				query={ query }
				component={ proxiedComponent || Component }
				placeholder={ placeholder }
				maxSize={ maxSize }
				{ ...rest }
			/>
		);
	} else if ( useGoogleProxy ) {
		return (
			<GoogleProxiedImage
				fileUrl={ src }
				component={ Component }
				placeholder={ placeholder }
				{ ...rest }
			/>
		);
	}

	return <Component src={ src } { ...rest } />;
};

export default connect( ( state: IAppState, { src }: Pick< MediaFileProps, 'src' > ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state ) as string;
	const { filePath, query, isRelativeToSiteRoot } = mediaURLToProxyConfig( src, siteSlug );
	const isJetpackNonAtomic =
		siteId && isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } );
	const useProxy = ! isJetpackNonAtomic && !! filePath && isRelativeToSiteRoot;
	const useGoogleProxy =
		config.isEnabled( 'google-photos-picker' ) && src.includes( 'googleusercontent' );

	return {
		siteId,
		query,
		siteSlug,
		useProxy,
		useGoogleProxy,
		src,
		filePath,
	};
} )( MediaFile );
