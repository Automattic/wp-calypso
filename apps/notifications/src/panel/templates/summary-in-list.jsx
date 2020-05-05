import React from 'react';
import { connect } from 'react-redux';
import { flowRight as compose } from 'lodash';

import Gridicon from './gridicons';
import noticon2gridicon from '../utils/noticon2gridicon';

import actions from '../state/actions';

import ImagePreloader from './image-loader';

import { html } from '../indices-to-html';

var debug = require( 'debug' )( 'notifications:summary-in-list' );
var { recordTracksEvent } = require( '../helpers/stats' );

export class SummaryInList extends React.Component {
	handleClick = ( event ) => {
		event.stopPropagation();
		event.preventDefault();

		if ( event.metaKey || event.shiftKey ) {
			window.open( this.props.note.url, '_blank' );
		} else {
			if ( this.props.currentNote == this.props.note.id ) {
				this.props.unselectNote();
			} else {
				recordTracksEvent( 'calypso_notification_note_open', {
					note_type: this.props.note.type,
				} );
				this.props.selectNote( this.props.note.id );
			}
		}
	};

	render() {
		var subject = html( this.props.note.subject[ 0 ], {
			links: false,
		} );
		var excerpt = null;

		if ( 1 < this.props.note.subject.length ) {
			excerpt = <div className="wpnc__excerpt">{ this.props.note.subject[ 1 ].text }</div>;
		}

		return (
			<div className="wpnc__summary" onClick={ this.handleClick }>
				<div className="wpnc__note-icon">
					<ImagePreloader
						src={ this.props.note.icon }
						placeholder={
							<img src="https://www.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=128" />
						}
					/>
					<span className="wpnc__gridicon">
						<Gridicon icon={ noticon2gridicon( this.props.note.noticon ) } size={ 12 } />
					</span>
				</div>
				<div className="wpnc__text-summary">
					<div className="wpnc__subject" dangerouslySetInnerHTML={ { __html: subject } } />
					{ excerpt }
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = ( dispatch ) => ( {
	selectNote: compose( dispatch, actions.ui.selectNote ),
	unselectNote: compose( dispatch, actions.ui.unselectNote ),
} );

export default connect( null, mapDispatchToProps, null, { pure: false } )( SummaryInList );
