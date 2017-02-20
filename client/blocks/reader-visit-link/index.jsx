/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';

class ReaderVisitLink extends React.Component {

	static propTypes = {
		url: React.PropTypes.string,
		iconSize: React.PropTypes.number,
		onClick: React.PropTypes.func,
	}

	static defaultProps = {
		iconSize: 24,
		onClick: noop,
	}

	render() {
		return (
			<ExternalLink
				className="reader-visit-link"
				href={ this.props.href }
				target="_blank"
				icon={ true }
				showIconFirst={ true }
				iconSize={ this.props.iconSize }
				onClick={ this.props.onClick }>
				<span className="reader-visit-link__label">
					{ this.props.children }
				</span>
			</ExternalLink>
		);
	}

}

export default ReaderVisitLink;
