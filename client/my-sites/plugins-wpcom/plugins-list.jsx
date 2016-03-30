import React from 'react';
import matchesProperty from 'lodash/matchesProperty';

import HeaderCake from 'components/header-cake';

import StandardPlugin from './plugin-types/standard-plugin';
import standardPlugins from './standard-plugins';

export const PluginsList = React.createClass( {
	getInitialState: () => ( {
		selectedPlugin: null
	} ),

	goBack() {
		return this.selectPlugin( null );
	},

	selectPlugin( selectedPlugin ) {
		return () => this.setState( { selectedPlugin } );
	},

	render() {
		const { selectedPlugin } = this.state;

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
				<HeaderCake onClick={ this.goBack() }>Standard Plugins</HeaderCake>
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
