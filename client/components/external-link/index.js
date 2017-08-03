/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classnames from 'classnames';
import { assign, omit } from 'lodash';
import Gridicon from 'gridicons';

export default React.createClass( {

	displayName: 'ExternalLink',

	mixins: [ PureRenderMixin ],

	propTypes: {
		className: React.PropTypes.string,
		href: React.PropTypes.string,
		onClick: React.PropTypes.func,
		icon: React.PropTypes.bool,
		iconSize: React.PropTypes.number,
		target: React.PropTypes.string,
		showIconFirst: React.PropTypes.bool,
		iconClassName: React.PropTypes.string,
	},

	getDefaultProps() {
		return {
			iconSize: 18,
			showIconFirst: false
		};
	},

	render() {
		const classes = classnames( 'external-link', this.props.className, {
			'has-icon': !! this.props.icon,
		} );
		const props = assign( {}, omit( this.props, 'icon', 'iconSize', 'showIconFirst', 'iconClassName' ), {
			className: classes,
			rel: 'external'
		} );

		if ( props.target ) {
			props.rel = props.rel.concat( ' noopener noreferrer' );
		}

		const iconComponent = <Gridicon className={ this.props.iconClassName } icon="external" size={ this.props.iconSize } />;

		return (
			<a { ...props }>
				{ this.props.icon && this.props.showIconFirst && iconComponent }
				{ this.props.children }
				{ this.props.icon && ! this.props.showIconFirst && iconComponent }
			</a>
		);
	}
} );
