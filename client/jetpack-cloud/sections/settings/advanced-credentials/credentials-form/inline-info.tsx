/**
 * External dependencies
 */
import { useDispatch } from 'react-redux';
import React, { FunctionComponent, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import * as HostInfo from '../host-info';

interface Props {
	field: string;
	host: string;
	info: HostInfo.Info[] | HostInfo.InfoSplit;
	protocol: 'ftp' | 'ssh';
}

const InlineInfo: FunctionComponent< Props > = ( { field, host, info, protocol } ) => {
	const dispatch = useDispatch();

	const choseSplitInfo = ( splitInfo: HostInfo.InfoSplit ) =>
		protocol === 'ftp' ? splitInfo.ftp : splitInfo.sftp;

	const infoToRender = HostInfo.infoIsSplit( info ) ? choseSplitInfo( info ) : info;

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_advanced_credentials_flow_inline_info_view', {
				field,
				host,
				protocol,
			} )
		);
	}, [ dispatch, field, host, protocol ] );

	return (
		<div className="inline-info">
			{ infoToRender.map( ( infom, topLevelIndex ) => {
				if ( HostInfo.infoIsLink( infom ) ) {
					return (
						<a key={ topLevelIndex } href={ infom.link } target="_blank" rel="noreferrer noopener">
							{ infom.text }
						</a>
					);
				} else if ( HostInfo.infoIsText( infom ) ) {
					return <p key={ topLevelIndex }>{ infom.text }</p>;
				} else if ( HostInfo.infoIsOrderedList( infom ) ) {
					return (
						<ol key={ topLevelIndex }>
							{ infom.items.map( ( text, index ) => (
								<li key={ index }>{ text }</li>
							) ) }
						</ol>
					);
				} else if ( HostInfo.infoIsUnorderedList( infom ) ) {
					return (
						<ul key={ topLevelIndex }>
							{ infom.items.map( ( text, index ) => (
								<li key={ index }>{ text }</li>
							) ) }
						</ul>
					);
				} else if ( HostInfo.infoIsLine( infom ) ) {
					return <hr key={ topLevelIndex } />;
				}
				return null;
			} ) }
		</div>
	);
};

export default InlineInfo;
