import PropTypes from 'prop-types';
import { Component } from 'react';
import InlineHelpCompactResult from 'calypso/blocks/inline-help/inline-help-compact-result';

class InlineHelpCompactResults extends Component {
	static propTypes = {
		helpLinks: PropTypes.array.isRequired,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		helpLinks: [],
	};

	render() {
		return (
			<ul className="inline-help__results-list">
				{ this.props.helpLinks.map( ( link ) => (
					<InlineHelpCompactResult
						key={ link.link + '#' + link.id }
						helpLink={ link }
						onClick={ this.props.onClick }
					/>
				) ) }
			</ul>
		);
	}
}

export default InlineHelpCompactResults;
