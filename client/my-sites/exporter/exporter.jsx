/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import AdvancedSettings from 'my-sites/exporter/advanced-settings';

export default React.createClass( {
	displayName: 'Exporter',

	propTypes: {
		toggleAdvancedSettings: PropTypes.func.isRequired,
		toggleSection: PropTypes.func.isRequired,
		advancedSettings: PropTypes.shape( {
			isVisible: PropTypes.bool.isRequired
		} ).isRequired
	},

	render: function() {
		const { toggleAdvancedSettings, toggleSection, advancedSettings } = this.props;

		return (
			<div className="exporter">
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
							icon={ advancedSettings.isVisible ? 'chevron-up' : 'chevron-down' }
							size={ 16 } />
						{ this.translate( 'Advanced Export Settings' ) }
					</a>
				</CompactCard>

				{
					advancedSettings.isVisible &&
					<AdvancedSettings
						{ ...advancedSettings }
						onToggleFieldset={ toggleSection }
					/>
				}
			</div>
		);
	}
} );
