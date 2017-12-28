/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLink from 'client/components/external-link';

class ReaderVisitLink extends React.Component {
	static propTypes = {
		href: PropTypes.string,
		iconSize: PropTypes.number,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		iconSize: 24,
		onClick: noop,
	};

	render() {
		return (
			<ExternalLink
				className="reader-visit-link"
				href={ this.props.href }
				target="_blank"
				icon={ true }
				showIconFirst={ true }
				iconSize={ this.props.iconSize }
				iconClassName="reader-visit-link__icon"
				onClick={ this.props.onClick }
			>
				<span className="reader-visit-link__label">{ this.props.children }</span>
			</ExternalLink>
		);
	}
}

export default ReaderVisitLink;
