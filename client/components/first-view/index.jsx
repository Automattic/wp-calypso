/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import RootChild from 'components/root-child';
import { getSectionName } from 'state/ui/selectors';
import { shouldViewBeVisible } from 'state/ui/first-view/selectors';
import { hideView } from 'state/ui/first-view/actions';

// component to avoid having a wrapper element for the transition
// see: https://facebook.github.io/react/docs/animation.html#rendering-a-single-child
const TransitionGroupComponent = ( props ) => {
	const children = React.Children.toArray( props.children );
	return children[ 0 ] || null;
};

const FirstView = React.createClass( {
	mixins: [ PureRenderMixin ],

	getInitialState() {
		return {
			isEnabled: false,
		};
	},

	componentDidMount() {
		this.updatePageScrolling();
	},

	componentDidUpdate() {
		this.updatePageScrolling();
	},

	componentWillUnmount() {
		this.allowPageScrolling();
	},

	render() {
		const classes = classNames( 'first-view', {
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
											checked={ ! this.state.isEnabled }
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
		this.props.hideView( { view: this.props.sectionName, enabled: this.state.isEnabled } );
	},

	enableOrDisableNextTime( event ) {
		this.setState( {
			isEnabled: event.target.value
		} );
	},

	updatePageScrolling() {
		if ( this.props.isVisible ) {
			this.preventPageScrolling();
		} else {
			this.allowPageScrolling();
		}
	},

	preventPageScrolling() {
		document.documentElement.classList.add( 'no-scroll' );
	},

	allowPageScrolling() {
		document.documentElement.classList.remove( 'no-scroll' );
	}
} );

export default connect(
	( state ) => {
		const sectionName = getSectionName( state );

		return {
			sectionName: sectionName,
			isVisible: shouldViewBeVisible( state ),
		};
	},
	dispatch => bindActionCreators( {
		hideView
	}, dispatch )
)( FirstView );
