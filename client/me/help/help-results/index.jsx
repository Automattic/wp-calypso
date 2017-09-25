/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import HelpResult from './item';
import SectionHeader from 'components/section-header';

module.exports = React.createClass( {
	displayName: 'HelpResults',

	mixins: [ PureRenderMixin ],

	render: function() {
		if ( ! this.props.helpLinks.length ) {
			return null;
		}

		return (
			<div className="help-results">
				<SectionHeader label={ this.props.header } />
				{ this.props.helpLinks.map( helpLink =>
					<HelpResult
						key={ helpLink.link } helpLink={ helpLink } iconTypeDescription={ this.props.iconTypeDescription }
						onClick={ this.props.onClick } /> )
				}
				<a href={ this.props.searchLink } target="__blank">
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
