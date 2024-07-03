import PropTypes from 'prop-types';
import { Component } from 'react';
import ExternalLink from 'calypso/components/external-link';
import ReaderExternalIcon from 'calypso/reader/components/icons/external-icon';

import './style.scss';

const noop = () => {};

class ReaderVisitLink extends Component {
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
				icon
				showIconFirst
				iconSize={ 24 }
				iconClassName="reader-visit-link__icon"
				iconComponent={ ReaderExternalIcon( { iconSize: 20 } ) }
				onClick={ this.props.onClick }
			>
				<span className="reader-visit-link__label">{ this.props.children }</span>
			</ExternalLink>
		);
	}
}

export default ReaderVisitLink;
