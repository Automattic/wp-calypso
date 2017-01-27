/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import QueryPlugin from './query-plugin';
import { getSelectedSite } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const render = ( context ) => {
	renderWithReduxStore( (
		<LeWidget />
	), document.getElementById( 'primary' ), context.store );
};

const Widget = props => {
	return (
		<Main className="talk-to-plugin__main">
			<SectionHeader label="Hello Remote Plugin!"></SectionHeader>
			<Card>
				<div>
					{
						props.isJetpackSite
						? (
							<div>
								<QueryPlugin siteId={ props.site.ID } path="/posts" />
								<p>Cowabunga { props.site.ID }</p>
							</div>
						)
						: (
							<p>This is not a Jetpack site</p>
						)
					}
				</div>
			</Card>
		</Main>
	);
};

const LeWidget = connect(
	state => ( {
		site: getSelectedSite( state ),
		isJetpackSite: isJetpackSite( state, getSelectedSite( state ).ID )
	} )
)( Widget );

export default function() {
	page( '/talktoplugin/:site?', siteSelection, navigation, render );
}
