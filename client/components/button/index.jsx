/**
 * External dependencies
 */
import { PropTypes, createElement, PureComponent } from 'react';
import classNames from 'classnames';
import { omit, uniq, compact } from 'lodash';

export default class Button extends PureComponent {
	static propTypes = {
		compact: PropTypes.bool,
		primary: PropTypes.bool,
		scary: PropTypes.bool,
		busy: PropTypes.bool,
		type: PropTypes.string,
		href: PropTypes.string,
		borderless: PropTypes.bool,
		target: PropTypes.string,
		rel: PropTypes.string
	};

	static defaultProps = {
		type: 'button'
	};

	render() {
		const omitProps = [ 'compact', 'primary', 'scary', 'busy', 'borderless' ];

		let tag;
		if ( this.props.href ) {
			tag = 'a';
			omitProps.push( 'type' );
		} else {
			tag = 'button';
			omitProps.push( 'target', 'rel' );
		}

		const props = omit( this.props, omitProps );

		// Block referrers when external link
		if ( props.target ) {
			props.rel = uniq( compact( [
				...( props.rel || '' ).split( ' ' ),
				'noopener',
				'noreferrer'
			] ) ).join( ' ' );
		}

		return createElement( tag, {
			...props,
			className: classNames( 'button', this.props.className, {
				'is-compact': this.props.compact,
				'is-primary': this.props.primary,
				'is-scary': this.props.scary,
				'is-busy': this.props.busy,
				'is-borderless': this.props.borderless
			} )
		} );
	}
}
