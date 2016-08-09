/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
	identity,
	invoker
} from 'ramda';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import Layout from './layout';
import fromApi from './from-api.js';

const inBrowser = (() => (
	( 'undefined' !== typeof window ) &&
	( 'undefined' !== typeof document )
))();

const addListener = invoker( 3, 'addEventListener' );
const removeListener = invoker( 3, 'removeEventListener' );
const defaultPreventer = invoker( 0, 'preventDefault' );

const toggleCapturedScroll = doCapture => () => {
	if ( ! inBrowser ) {
		return;
	}

	const toggle = doCapture
		? addListener
		: removeListener;

	[ 'mousewheel', 'touchmove' ]
		.forEach( event => toggle( event, defaultPreventer, false, document.body ) );
};

export class NotificationsPanel extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			notes: [],
			selectedNote: null
		};

		wpcom
			.req
			.get( {
				path: '/notifications/',
				apiVersion: '1.1'
			}, { number: 10 } )
			.then( response => {
				const {
					lastSeenTime,
					notes
				} = fromApi( response );
				console.log( notes[0] );

				this.setState( { notes } );
			} );

		this.toggleListeners = this.toggleListeners.bind( this );
	}

	componentDidMount() {
		this.toggleListeners( true );
	}

	componentWillUnmount() {
		this.toggleListeners( false );
		toggleCapturedScroll( false );
	}

	toggleListeners( doToggleOn ) {
		const {
			clickInterceptor
		} = this.props;

		if ( ! inBrowser ) {
			return;
		}

		const toggle = doToggleOn
			? addListener
			: removeListener;

		[
			[ 'mousedown', clickInterceptor, true ],
			[ 'touchstart', clickInterceptor, true ],
			document.documentElement.classList.contains( 'touch' ) &&
				[ 'touchmove', defaultPreventer, false ]
		]
			.filter( identity )
			.forEach( ( [ event, action, useCapture ] ) => toggle( event, action, useCapture, window ) );
	}

	render() {
		const {
			notes,
			selectedNote
		} = this.state;

		return (
			<div
				id="wpnt-notes-panel2"
				onMouseEnter={ toggleCapturedScroll( true ) }
				onMouseLeave={ toggleCapturedScroll( false ) }
			>
				<Layout { ...{
					notes,
					selectedNote
				} } />
			</div>
		);
	}
}

NotificationsPanel.displayName = 'NotificationsPanel';

NotificationsPanel.propTypes = {
	clickInterceptor: PropTypes.func
};

const mapStateToProps = state => ( {
	notes: [],
	selectedNote: null
} );

const mapDispatchToProps = dispatch => ( {

} );

export default connect( mapStateToProps, mapDispatchToProps )( NotificationsPanel );
