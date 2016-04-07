/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import HeaderCakeBack from './back';

export default React.createClass( {

	displayName: 'HeaderCake',

	propTypes: {
		onClick: PropTypes.func.isRequired,
		onTitleClick: PropTypes.func,
		backText: PropTypes.string,
		backHref: PropTypes.string,
	},

	getDefaultProps() {
		return {
			isCompact: false
		};
	},

	render() {
		const { backText, backHref } = this.props;
		const classes = classNames(
			'header-cake',
			this.props.className,
			{
				'is-compact': this.props.isCompact
			}
		);

		return (
			<Card className={ classes }>
				<HeaderCakeBack text={ backText } href={ backHref } onClick={ this.props.onClick } />
				<div className="header-cake__title" onClick={ this.props.onTitleClick }>
					{ this.props.children }
				</div>
				<HeaderCakeBack text={ backText } href={ backHref } spacer />
			</Card>
		);
	}

} );
