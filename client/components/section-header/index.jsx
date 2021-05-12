/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import Count from 'calypso/components/count';
import SupportInfo from 'calypso/components/support-info';

/**
 * Style dependencies
 */
import './style.scss';

export default class SectionHeader extends PureComponent {
	static defaultProps = {
		label: '',
		popoverText: '',
		href: null,
		isPlaceholder: false,
	};

	render() {
		const hasCount = 'number' === typeof this.props.count;
		const isEmpty = ! ( this.props.label || hasCount || this.props.children );
		const classes = classNames( this.props.className, 'section-header', {
			'is-empty': isEmpty,
			'is-placeholder': this.props.isPlaceholder,
		} );
		const { id, popoverText } = this.props;
		const otherProps = { id };

		return (
			<CompactCard className={ classes } href={ this.props.href } { ...otherProps }>
				<div className="section-header__label">
					<span className="section-header__label-text">{ this.props.label }</span>
					{ hasCount && <Count count={ this.props.count } /> }
					{ popoverText && ! this.props.isPlaceholder && (
						<SupportInfo position="right" text={ popoverText } />
					) }
				</div>
				<div className="section-header__actions">{ this.props.children }</div>
			</CompactCard>
		);
	}
}
