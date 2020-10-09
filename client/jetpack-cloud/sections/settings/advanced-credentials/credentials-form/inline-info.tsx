/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import * as HostInfo from '../host-info';

interface Props {
	info: HostInfo.Info[] | HostInfo.InfoSplit;
	credentialType: 'ftp' | 'ssh';
}

const InlineInfo: FunctionComponent< Props > = ( { credentialType, info } ) => {
	const choseSplitInfo = ( splitInfo: HostInfo.InfoSplit ) =>
		credentialType === 'ftp' ? splitInfo.ftp : splitInfo.sftp;

	const infoToRender = HostInfo.infoIsSplit( info ) ? choseSplitInfo( info ) : info;

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
