/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';

import styles from './style.scss';

const getClassName = ( { className, compact, displayAsLink, highlight, href, onClick } ) =>
	classNames( styles.card, className, {
		[ styles.isCardLink ]: displayAsLink || !! href,
		[ styles.isClickable ]: !! onClick,
		[ styles.isCompact ]: compact,
		[ styles.isHighlight ]: highlight,
		[ styles.isError ]: highlight === 'error',
		[ styles.isInfo ]: highlight === 'info',
		[ styles.isSuccess ]: highlight === 'success',
		[ styles.isWarning ]: highlight === 'warning',
	} );

class Card extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		displayAsLink: PropTypes.bool,
		href: PropTypes.string,
		tagName: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ).isRequired,
		target: PropTypes.string,
		compact: PropTypes.bool,
		highlight: PropTypes.oneOf( [ false, 'error', 'info', 'success', 'warning' ] ),
	};

	static defaultProps = {
		tagName: 'div',
		highlight: false,
	};

	render() {
		const {
			children,
			compact,
			displayAsLink,
			highlight,
			tagName: TagName,
			href,
			target,
			...props
		} = this.props;

		return href ? (
			<a { ...props } href={ href } target={ target } className={ getClassName( this.props ) }>
				<Gridicon
					className={ styles.linkIndicator }
					icon={ target ? 'external' : 'chevron-right' }
				/>
				{ children }
			</a>
		) : (
			<TagName { ...props } className={ getClassName( this.props ) }>
				{ displayAsLink && (
					<Gridicon
						className={ styles.linkIndicator }
						icon={ target ? 'external' : 'chevron-right' }
					/>
				) }
				{ children }
			</TagName>
		);
	}
}

export default Card;
