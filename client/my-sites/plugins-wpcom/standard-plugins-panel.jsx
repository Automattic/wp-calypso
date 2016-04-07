import React, { PropTypes } from 'react';

import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import Gridicon from 'components/gridicon';

import StandardPlugin from './plugin-types/standard-plugin';
import standardPlugins from './standard-plugins';

export const StandardPluginsPanel = React.createClass( {
	render() {
		const {
			displayCount,
			plugins: givenPlugins = standardPlugins
		} = this.props;
		
		const plugins = givenPlugins.slice( 0, displayCount );

		return (
			<div>
				<SectionHeader label={ this.translate( 'Standard Plugin Suite' ) }>
					<Button className="is-active-plugin" compact borderless>
						<Gridicon icon="checkmark" />{ this.translate( 'Active' ) }
					</Button>
				</SectionHeader>
				<CompactCard className="wpcom-plugins__standard-panel">
					<div className="wpcom-plugins__list">
						{ plugins.map( ( { name, supportLink, icon, category, description } ) =>
							<StandardPlugin
								{ ...{ name, key: name, supportLink, icon, category, description } }
							/>
						) }
					</div>
				</CompactCard>
			</div>
		);
	}
} );

StandardPluginsPanel.propTypes = {
	displayCount: PropTypes.number,
	plugins: PropTypes.array
};

export default StandardPluginsPanel;
