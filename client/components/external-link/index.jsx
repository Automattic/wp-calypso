/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classnames from 'classnames';
import { assign, omit } from 'lodash';
import Gridicon from 'gridicons';

export default React.createClass( {

	displayName: 'ExternalLink',

	mixins: [ PureRenderMixin ],

	propTypes: {
		className: PropTypes.string,
		href: PropTypes.string,
		onClick: PropTypes.func,
		icon: PropTypes.bool,
		iconSize: PropTypes.number,
		target: PropTypes.string,
		showIconFirst: PropTypes.bool,
		iconClassName: PropTypes.string,
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
