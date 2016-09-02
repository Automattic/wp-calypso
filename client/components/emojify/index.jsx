/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import twemoji from 'twemoji';
import config from 'config';

export default React.createClass( {
	displayName: 'Emojify',

	mixins: [ PureRenderMixin ],

	propTypes: {
		children: PropTypes.string.isRequired,
		size: PropTypes.oneOf( [
			'16x16', '36x36', '72x72'
		] ),
		className: PropTypes.string
	},

	componentDidMount: function() {
		this._parseEmoji();
	},

	componentDidUpdate: function() {
		this._parseEmoji();
	},

	getDefaultProps: function() {
		return {
			size: '36x36',
			className: 'emojify__emoji'
		};
	},

	_parseEmoji: function() {
		const { size, className } = this.props;

		twemoji.parse( this.refs.emojified, {
			base: config( 'twemoji_cdn_url' ),
			size: size,
			className: className
		} );
	},

	render: function() {
		return (
			<span ref="emojified">{ this.props.children }</span>
		);
	}
} );
