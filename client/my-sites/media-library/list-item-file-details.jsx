/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './list-item-file-details.scss';

export default class extends React.Component {
	static displayName = 'MediaLibraryListItemFileDetails';

	static propTypes = {
		media: PropTypes.object,
		scale: PropTypes.number,
		icon: PropTypes.string,
	};

	static defaultProps = {
		icon: 'pages',
	};

	render() {
		return (
			<div className="media-library__list-item-file-details media-library__list-item-centered">
				<div className="media-library__list-item-icon">
					<Gridicon icon={ this.props.icon } />
				</div>
				<div
					className="media-library__list-item-file-name"
					style={ { fontSize: 12 * ( 1 + this.props.scale ) } }
				>
					{ this.props.media.title }
				</div>
				<hr className="media-library__list-item-details-separator" />
				<div
					className="media-library__list-item-file-extension"
					style={ { fontSize: 9 * ( 1 + this.props.scale ) } }
				>
					{ ( this.props.media.extension || '' ).toUpperCase() }
				</div>
			</div>
		);
	}
}
