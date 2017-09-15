/**
 * External dependencies
 */
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { takeRight, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import CompactCard from 'components/card/compact';
import Count from 'components/count';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';

class MediaLibraryFooter extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			width: 0,
		};
	}

	componentDidMount() {
		this.throttleOnResize = throttle( this.calculateWidth, 200 );
		window.addEventListener( 'resize', this.throttleOnResize );
		this.calculateWidth();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.throttleOnResize );
	}

	calculateWidth() {
		const { parent } = this.props;
		const width = ReactDom.findDOMNode( parent ).clientWidth;
		this.setState( { width } );
	}

	renderSelectedItem = ( item, index ) => {
		const mimePrefix = MediaUtils.getMimePrefix( item );

		const url = MediaUtils.url( item, {
			photon: true,
			maxWidth: 96,
			size: 'small',
		} );

		if ( 'image' === mimePrefix ) {
			return (
				<div key={ index } className="media-library__footer-thumb">
					<img src={ url } />
				</div>
			);
		}

		if ( 'video' === mimePrefix ) {
			let videoThumb = null;
			if ( this.props.media.thumbnails ) {
				videoThumb = this.props.media.thumbnails.fmt_hd ||
					this.props.media.thumbnails.fmt_dvd ||
					this.props.media.thumbnails.fmt_std;
			}

			if ( videoThumb ) {
				return (
					<div key={ index } className="media-library__footer-thumb">
						<img src={ url } />
					</div>
				);
			}

			return (
				<div key={ index } className="media-library__footer-thumb">
					<Gridicon icon="video" size={ 48 } />
				</div>
			);
		}

		return (
			<div key={ index } className="media-library__footer-thumb">
				<Gridicon icon="pages" size={ 48 } />
			</div>
		);
	};

	onCancel = () => {
		const { site } = this.props;
		MediaActions.setLibrarySelectedItems( site.ID, [] );
	};

	render() {
		const { selectedItems, onViewDetails, onDeleteItem, translate } = this.props;

		if ( ! selectedItems || ! selectedItems.length ) {
			return null;
		}

		return (
			<CompactCard className="media-library__footer" style={ { width: this.state.width + 'px' } }>
				<div className="media-library__footer-buttons">
					<Button onClick={ this.onCancel }>{ translate( 'Cancel' ) }</Button>
				</div>
				<div className="media-library__footer-count">
					<Count count={ selectedItems.length } />
					<span className="media-library__footer-count-label">{ translate( 'Selected' ) }</span>
				</div>
				<div className="media-library__footer-thumbs">
					{ takeRight( selectedItems, 5 ).map( this.renderSelectedItem ) }
				</div>
				<div className="media-library__footer-buttons">
					<ButtonGroup>
						<Button primary onClick={ onViewDetails }>Edit</Button>
						<Button scary onClick={ onDeleteItem }><Gridicon icon="trash" size={ 48 } /></Button>
					</ButtonGroup>
				</div>
			</CompactCard>
		);
	}
};

MediaLibraryFooter.propTypes = {
	site: PropTypes.object.isRequired,
	selectedItems: PropTypes.array,
	onViewDetails: PropTypes.func.isRequired,
	onDeleteItem: PropTypes.func.isRequired,
};

export default localize( MediaLibraryFooter );
