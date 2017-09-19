/** @format */
/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { handleGapClicked } from 'reader/utils';

class Gap extends React.Component {
	static propTypes = {
		gap: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired,
		selected: PropTypes.bool,
	};

	state = { isFilling: false };

	handleClick = () => {
		this.setState( { isFilling: true } );
		handleGapClicked( this.props.gap, this.props.store.id );
	};

	render() {
		const classes = classnames( {
			'reader-list-gap': true,
			'is-filling': this.state.isFilling,
			'is-selected': this.props.selected,
		} );
		const { translate } = this.props;

		return (
			<div className={ classes } onClick={ this.handleClick }>
				<button type="button" className="button reader-list-gap__button">
					{ translate( 'Load More Posts' ) }
				</button>
			</div>
		);
	}
}

export default localize( Gap );
