/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

module.exports = React.createClass( {
	displayName: 'HelpResult',

	mixins: [ React.addons.PureRenderMixin ],

	onClick: function( event ) {
		if ( this.props.helpLink.disabled ) {
			event.preventDefault();
		}
	},

	render: function() {
		return (
			<a className="help-result" href={ this.props.helpLink.link } target="__blank" onClick={ this.onClick }>
				<CompactCard className="help-result__wrapper">
					<svg className="help-result__icon" width="24" height="24" viewBox="0 0 24 24">
						<defs>
							<path id="a" d="M0 0h656v92H0z" />
						</defs>
						<g fill="none" fill-rule="evenodd">
							<g transform="translate(-16 -15)">
								<use stroke="#E9EFF3" />
								<path className="help-result__icon-path" d={ this.props.iconPathDescription } transform="translate(16 15)" mask="url(#b)" fill="#87A6BC" />
							</g>
						</g>
					</svg>
					<h2 className="help-result__title">{ this.props.helpLink.title }</h2>
					<p className="help-result__description">{ this.props.helpLink.description }</p>
				</CompactCard>
			</a>
		);
	}
} );
