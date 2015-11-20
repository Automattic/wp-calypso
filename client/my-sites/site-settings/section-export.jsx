/**
 * External dependencies
 */
import React from 'react';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import AdvancedOptions from 'my-sites/exporter/advanced-options';

const defaults = {
	advancedSettings: {
		isVisible: false,
		posts: {
			isEnabled: true
		},
		pages: {
			isEnabled: true
		},
		feedback: {
			isEnabled: true
		}
	}
}

export default React.createClass( {
	displayName: 'SiteSettingsExport',

	getInitialState() {
		this.data = Immutable.fromJS( defaults );
		return this.data.toJS();
	},

	toggleAdvancedSettings() {
		this.data = this.data.updateIn(
			[ 'advancedSettings', 'isVisible' ],
			( wasVisible ) => !wasVisible
		);
		this.setState( this.data.toJS() );
	},

	toggleFieldset( fieldset ) {
		this.data = this.data.updateIn(
			[ 'advancedSettings', fieldset, 'isEnabled' ],
			( wasEnabled ) => !wasEnabled
		);
		this.setState( this.data.toJS() );
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
					<a href="#" onClick={ this.toggleAdvancedSettings }>
						<Gridicon
							icon={ this.state.advancedSettings.visible ? 'chevron-up' : 'chevron-down' }
							size={ 16 } />
						{ this.translate( 'Advanced Export Settings' ) }
					</a>
				</CompactCard>

				{
					this.state.advancedSettings.isVisible &&
					<AdvancedOptions
						{ ...this.state.advancedSettings }
						onToggleFieldset={ this.toggleFieldset }
					/>
				}
			</div>
		);
	}
} );
