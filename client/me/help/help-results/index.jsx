/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import HelpResult from './item';

module.exports = React.createClass( {
	displayName: 'HelpResults',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		if ( ! this.props.helpLinks.length ) {
			return null;
		}

		return (
			<div className="help-results">
				<CompactCard className="help-results__header">
					<span className="help-results__header-text">
						{ this.props.header }
					</span>
				</CompactCard>
				{ this.props.helpLinks.map( helpLink => <HelpResult key={ helpLink.link } helpLink={ helpLink } iconPathDescription={ this.props.iconPathDescription } /> ) }
				<a href={ this.props.searchLink } target="__blank" >
					<CompactCard className="help-results__footer">
						<span className="help-results__footer-text">
							{ this.props.footer }
						</span>
					</CompactCard>
				</a>
			</div>
		);
	}
} );
