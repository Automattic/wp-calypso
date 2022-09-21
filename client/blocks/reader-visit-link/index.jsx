import PropTypes from 'prop-types';
import { Component } from 'react';
import ExternalLink from 'calypso/components/external-link';

import './style.scss';

const noop = () => {};

class ReaderVisitLink extends Component {
	static propTypes = {
		href: PropTypes.string,
		iconSize: PropTypes.number,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		iconSize: 20,
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
				iconSize="20"
				iconClassName="reader-visit-link__icon"
				onClick={ this.props.onClick }
			>
				<span className="reader-visit-link__label">{ this.props.children }</span>
			</ExternalLink>
		);
	}
}

export default ReaderVisitLink;
