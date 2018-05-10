/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { fillGap } from 'state/reader/streams/actions';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

class Gap extends React.Component {
	static propTypes = {
		gap: PropTypes.object.isRequired,
		streamKey: PropTypes.string.isRequired,
		selected: PropTypes.bool,
	};

	state = { isFilling: false };

	handleClick = () => {
		const { streamKey, gap } = this.props;
		this.props.fillGap( { streamKey, gap } );
		recordAction( 'fill_gap' );
		recordGaEvent( 'Clicked Fill Gap' );
		recordTrack( 'calypso_reader_filled_gap', { stream: streamKey } );

		this.setState( { isFilling: true } );
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

export default localize( connect( null, { fillGap } )( Gap ) );
