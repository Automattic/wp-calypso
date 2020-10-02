/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import * as HostInfo from '../host-info';

interface Props {
	info: HostInfo.Info[];
}

const Info: FunctionComponent< Props > = ( { info } ) => {
	return (
		<div>
			{ info.map( ( infom ) => {
				if ( HostInfo.infoIsLink( infom ) ) {
					return <a href={ infom.link }>{ infom.text }</a>;
				} else if ( HostInfo.infoIsText( infom ) ) {
					return <p>{ infom.text }</p>;
				} else if ( HostInfo.infoIsOrderedList( infom ) ) {
					return (
						<ol>
							{ infom.items.map( ( text ) => (
								<li>{ text }</li>
							) ) }
						</ol>
					);
				} else if ( HostInfo.infoIsUnorderedList( infom ) ) {
					return (
						<ul>
							{ infom.items.map( ( text ) => (
								<li>{ text }</li>
							) ) }
						</ul>
					);
				} else if ( HostInfo.infoIsLine( infom ) ) {
					return <hr />;
				}
				return null;
			} ) }
		</div>
	);
};

export default Info;
