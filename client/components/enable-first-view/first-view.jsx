/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import RootChild from 'components/root-child';

// component to avoid having a wrapper element for the transition
// see: https://facebook.github.io/react/docs/animation.html#rendering-a-single-child
const TransitionGroupComponent = ( props ) => {
	const children = React.Children.toArray( props.children );
	return children[ 0 ] || null;
};

export default React.createClass( {
	mixins: [ PureRenderMixin ],

	getDefaultProps() {
		return {
			onEnableOrDisableNextTime: noop,
			onHide: noop
		};
	},

	render() {
		const classes = classNames( 'wp-content', 'first-view', {
			'is-visible': this.props.isVisible
		} );
		const firstViewContentClasses = classNames( 'first-view__content' );
		const firstViewHidePreferenceClasses = classNames( 'first-view__hide-preference' );

		return (
			<RootChild className={ classes }>
				<ReactCSSTransitionGroup transitionName="first-view-transition"
						component={ TransitionGroupComponent }
						transitionEnter={ false } transitionEnterTimeout={ 0 }
						transitionLeaveTimeout={ 250 }>
					{ this.props.isVisible && (
						<div key="content" className={ firstViewContentClasses }>
							{ this.props.children }

							<Button onClick={ this.hide }>{ this.translate( 'Got it!' ) }</Button>

							<div className={ firstViewHidePreferenceClasses }>
								<label>
									<input type="checkbox"
											checked={ ! this.props.isEnabledNextTime }
											onChange={ this.enableOrDisableNextTime } />
									{ this.translate( 'Don\'t show this again' ) }
								</label>
							</div>
						</div>
					) }
				</ReactCSSTransitionGroup>
			</RootChild>
		);
	},

	hide() {
		this.props.onHide();
	},

	enableOrDisableNextTime( event ) {
		this.props.onEnableOrDisableNextTime( event.target.value );
	}
} );
