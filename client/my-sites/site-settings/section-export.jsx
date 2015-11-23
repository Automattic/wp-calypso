/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import AdvancedOptions from 'my-sites/exporter/advanced-options';

import { toggleAdvancedSettings, toggleSection } from 'lib/exporter/actions';
import ExporterStore, { getState } from 'lib/exporter/store';

export default React.createClass( {
	displayName: 'SiteSettingsExport',

	propTypes: {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired
		} )
	},

	componentWillMount: function() {
		ExporterStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		ExporterStore.off( 'change', this.updateState );
	},

	getInitialState() {
		return getState();
	},

	updateState() {
		console.log( 'update state' );
		this.setState( getState() );
	},

	render: function() {
		return (
			<div className="section-export">
				<CompactCard>
					<header>
						<Button
							className="exporter__export-button"
							disabled={ false }
							isPrimary={ true }
						>
							{ this.translate( 'Export' ) }
						</Button>
						<h1 className="exporter__title">
							{ this.translate( 'Download an Export File' ) }
						</h1>
					</header>
					<a href="#" onClick={ toggleAdvancedSettings }>
						<Gridicon
							icon={ this.state.advancedSettings.isVisible ? 'chevron-up' : 'chevron-down' }
							size={ 16 } />
						{ this.translate( 'Advanced Export Settings' ) }
					</a>
				</CompactCard>

				{
					this.state.advancedSettings.isVisible &&
					<AdvancedOptions
						{ ...this.state.advancedSettings }
						onToggleFieldset={ toggleSection }
					/>
				}
			</div>
		);
	}
} );
