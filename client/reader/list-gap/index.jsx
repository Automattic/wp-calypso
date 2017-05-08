/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { handleGapClicked } from 'reader/utils';

class Gap extends React.Component {

	static propTypes = {
		gap: React.PropTypes.object.isRequired,
		store: React.PropTypes.object.isRequired,
		selected: React.PropTypes.bool
	};

	state = { isFilling: false };

	handleClick = () => {
		this.setState( { isFilling: true } );
		handleGapClicked( this.props.gap, this.props.store.id );
	}

	render() {
		const classes = classnames( {
			'reader-list-gap': true,
			'is-filling': this.state.isFilling,
			'is-selected': this.props.selected
		} );
		const { translate } = this.props;

		return (
			<div className={ classes } onClick={ this.handleClick } >
				<button type="button" className="button reader-list-gap__button">{ translate( 'Load More Posts' ) }</button>
			</div>
		);
	}
}

export default localize( Gap );
