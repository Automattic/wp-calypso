import React from 'react';
import matchesProperty from 'lodash/matchesProperty';
import noop from 'lodash/noop';

import HeaderCake from 'components/header-cake';

import StandardPlugin from './plugin-types/standard-plugin';
import standardPlugins from './standard-plugins';

export const PluginsList = React.createClass( {
	getInitialState: () => ( {
		selectedPlugin: null
	} ),

	selectPlugin( selectedPlugin ) {
		return () => this.setState( { selectedPlugin } );
	},

	render() {
		const { selectedPlugin } = this.state;

		/* development-only code - don't deploy! */
		const siteSlug = window.location.pathname.split( '/' ).pop();
		const backHref = `/plugins/${ siteSlug }`;
		/* end development-only section */

		if ( selectedPlugin ) {
			const plugin = standardPlugins
				.find( matchesProperty( 'name', selectedPlugin ) );

			return (
				<div className="wpcom-plugins-list__plugin-detail">
					<HeaderCake onClick={ this.selectPlugin( null ) }>
						{ plugin.name }
					</HeaderCake>
					<StandardPlugin
						{ ...plugin }
					/>
				</div>
			);
		}

		return (
			<div className="wpcom-plugins-list">
				<HeaderCake backHref={ backHref } onClick={ noop }>Standard Plugins</HeaderCake>
					{ standardPlugins.map( plugin =>
						<div
							key={ plugin.name }
							onClick={ this.selectPlugin( plugin.name ) }
						>
							<StandardPlugin
								{ ...plugin }
							/>
						</div>
					) }
			</div>
		);
	}
} );

export default PluginsList;
