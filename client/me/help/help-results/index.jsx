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

	/**
	 * Creates an onClick handler that has access to the helpLink.
	 *
	 * This is so we can use any additional data returned in the helpLink
	 * for tracking purposes.
	 * @param {function} onClick onClick handler
	 * @param {object} helpLink Help link data
	 * @return {function} Function that takes an event, and help link data
	 */
	createOnClick: function( onClick, helpLink ) {
		return function( event ) {
			return onClick( event, helpLink );
		};
	},

	render: function() {
		if ( ! this.props.helpLinks.length ) {
			return null;
		}

		return (
			<div className="help-results">
				<SectionHeader label={ this.props.header }/>
				{ this.props.helpLinks.map( helpLink =>
					<HelpResult
						key={ helpLink.link } helpLink={ helpLink } iconTypeDescription={ this.props.iconTypeDescription }
						onClick={ this.props.onClick ? this.createOnClick( this.props.onClick, helpLink ) : undefined } /> )
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
