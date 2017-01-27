/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'NoticeAction',

	propTypes: {
		href: React.PropTypes.string,
		onClick: React.PropTypes.func,
		external: React.PropTypes.bool,
		icon: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			external: false,
			download: false,
		};
	},

	render() {
		const attributes = {
			className: 'notice__action',
			href: this.props.href,
			onClick: this.props.onClick
		};

		if ( this.props.external ) {
			attributes.target = '_blank';
		}

		if ( this.props.download ) {
			attributes.download = '';
		}

		return (
			<a {...attributes} >
				<span>{ this.props.children }</span>
				{ this.props.icon && <Gridicon icon={ this.props.icon } size={ 24 } /> }
				{ this.props.external && <Gridicon icon="external" size={ 24 } /> }
			</a>
		);
	}
} );
