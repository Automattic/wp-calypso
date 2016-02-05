/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import ExternalLink from 'components/external-link';

module.exports = React.createClass( {
	displayName: 'HelpResult',

	mixins: [ PureRenderMixin ],

	onClick: function( event ) {
		if ( this.props.helpLink.disabled ) {
			event.preventDefault();
		}
	},

	render: function() {
		return (
			<div className="help-result">
				<CompactCard className="help-result__wrapper">
					<ExternalLink href={ this.props.helpLink.link } icon={ true } target="__blank" onClick={ this.onClick }>
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
					</ExternalLink>
				</CompactCard>
			</div>
		);
	}
} );
