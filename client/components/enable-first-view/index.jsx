/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FirstView from './first-view';

export default ( Wrapped, FirstViewContent ) => {
	const Wrapper = React.createClass( {
		mixins: [ PureRenderMixin ],

		getInitialState() {
			return {
				isFirstViewVisible: this.props.isFirstViewEnabled
			};
		},

		componentDidUpdate() {
			if ( this.state.isFirstViewVisible ) {
				this.preventPageScrolling();
			} else {
				this.allowPageScrolling();
			}
		},

		componentWillUnmount() {
			this.allowPageScrolling();
		},

		render() {
			if ( ! this.props.isFirstViewEnabled ) {
				return (
					<Wrapped { ...this.props } />
				);
			}

			const classes = classNames( 'first-viewable', {
				'is-first-view-visible': this.state.isFirstViewVisible
			} );

			return (
				<div className={ classes }>
					<FirstView isVisible={ this.state.isFirstViewVisible }
							onHide={ this.hideFirstView }
							isEnabledNextTime={ this.props.isFirstViewEnabledNextTime }
							onEnableOrDisableNextTime={ this.enableOrDisableFirstViewNextTime }>
						<FirstViewContent />
					</FirstView>
					<Wrapped { ...this.props } />
				</div>
			);
		},

		showFirstView() {
			// TODO: call Redux action
			this.setState( { isFirstViewVisible: true } );
		},

		hideFirstView() {
			// TODO: call Redux action
			this.setState( { isFirstViewVisible: false } );
		},

		enableOrDisableFirstViewNextTime( isEnabledNextTime ) {
			// TODO: call Redux action
		},

		preventPageScrolling: function() {
			document.documentElement.classList.add( 'no-scroll' );
		},

		allowPageScrolling: function() {
			document.documentElement.classList.remove( 'no-scroll' );
		}
	} );

	return connect(
		( state, ownProps ) => {
			return {
				// TODO: get from Redux state tree
				isFirstViewVisible: true,
				isFirstViewEnabled: true,
				isFirstViewEnabledNextTime: false
			};
		},
		( dispatch, ownProps ) => {
			return {
				// TODO
			};
		}
	)( Wrapper );
};
