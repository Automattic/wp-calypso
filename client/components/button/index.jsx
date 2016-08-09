/** @ssr-ready **/

/**
 * External dependencies
 */
import { PropTypes, createElement, PureComponent } from 'react';
import classNames from 'classnames';
import { omit } from 'lodash';

export default class Button extends PureComponent {
	static propTypes = {
		compact: PropTypes.bool,
		primary: PropTypes.bool,
		scary: PropTypes.bool,
		type: PropTypes.string,
		href: PropTypes.string,
		borderless: PropTypes.bool
	};

	static defaultProps = {
		type: 'button'
	};

	render() {
		const omitProps = [ 'compact', 'primary', 'scary', 'borderless' ];

		let tag;
		if ( this.props.href ) {
			tag = 'a';
			omitProps.push( 'type' );
		} else {
			tag = 'button';
		}

		return createElement( tag, {
			...omit( this.props, omitProps ),
			className: classNames( 'button', this.props.className, {
				'is-compact': this.props.compact,
				'is-primary': this.props.primary,
				'is-scary': this.props.scary,
				'is-borderless': this.props.borderless
			} )
		} );
	}
}
