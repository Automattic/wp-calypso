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
		backText: PropTypes.string
	},

	getDefaultProps() {
		return {
			isCompact: false
		};
	},

	render() {
		const backText = this.props.backText || this.translate( 'Back' );
		const classes = classNames(
			'header-cake',
			this.props.className,
			{
				'is-compact': this.props.isCompact
			}
		);

		return (
			<Card className={ classes }>
				<div className="header-cake__corner">
					<HeaderCakeBack text={ backText } onClick={ this.props.onClick } />
				</div>
				<div className="header-cake__title" onClick={ this.props.onTitleClick }>
					{ this.props.children }
				</div>
				<div className="header-cake__corner is-spacer">
					<HeaderCakeBack text={ backText } />
				</div>
			</Card>
		);
	}

} );
