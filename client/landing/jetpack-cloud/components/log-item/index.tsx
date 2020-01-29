/**
 * External dependencies
 */
import React, { ReactNode } from 'react';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import FoldableCard from 'components/foldable-card';

import './style.scss';

interface Props {
	children?: ReactNode;
	header: string;
	subheader: string;
	highlight?: 'info' | 'success' | 'warning' | 'error';
	tag?: string;
}

class LogItem extends React.PureComponent< Props > {
	static defaultProps = {
		highlight: 'info',
		tag: 'new',
	};

	renderHeader() {
		const { header, subheader, tag } = this.props;

		return (
			<div className="log-item__header-wrapper">
				<span className="log-item__tag">{ tag }</span>
				<CardHeading tagName="h2" size={ 18 }>
					{ header }
				</CardHeading>
				<p className="log-item__subheader">{ subheader }</p>
			</div>
		);
	}

	render() {
		const { highlight, children } = this.props;
		return (
			<FoldableCard header={ this.renderHeader() } className="log-item" highlight={ highlight }>
				{ children }
			</FoldableCard>
		);
	}
}

export default LogItem;
