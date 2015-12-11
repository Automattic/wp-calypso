/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/utility/noop';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'MasterbarItem',

	propTypes: {
		url: React.PropTypes.string,
		onClick: React.PropTypes.func,
		tooltip: React.PropTypes.string,
		icon: React.PropTypes.string,
		className: React.PropTypes.string,
		isActive: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			icon: '',
			onClick: noop
		};
	},

	render() {
		var itemClasses = classNames( 'masterbar__item', this.props.className, {
			'is-active': this.props.isActive,
		} );

		return (
			<a href={ this.props.url } onClick={ this.props.onClick } title={ this.props.tooltip } className={ itemClasses }>
				{ !! this.props.icon &&
					<Gridicon icon={ this.props.icon } size={ 24 } />
				}
				<span className="masterbar__item-content">{
						this.props.children
				}</span>
			</a>
		);
	}
} );
